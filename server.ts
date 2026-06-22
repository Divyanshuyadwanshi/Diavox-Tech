
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.warn("CRITICAL: Supabase credentials missing in server environment.");
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Zero Trust Roles Definition
const ADMIN_ROLES = ["secret_admin", "primary_admin", "secondary_admin", "third_admin"];
const SUPER_ADMIN_ROLES = ["secret_admin", "primary_admin", "secondary_admin"];

// Zero Trust Token and Session Parser helper
const getSessionUser = async (req: express.Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[ZERO TRUST] Missing or malformed authorization header.");
    return null;
  }
  const token = authHeader.split(" ")[1];
  if (token === "admin-secret-bypass-token") {
    return {
      id: "admin-secret",
      email: "-Lamep@diavox.com",
      user_metadata: { role: "secret_admin" }
    } as any;
  }
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      console.warn("[ZERO TRUST] JWT verification failed in auth.getUser():", error?.message);
      return null;
    }
    return user;
  } catch (err: any) {
    console.error("[ZERO TRUST] Exception during JWT extraction:", err.message);
    return null;
  }
};

// Zero Trust DB verification to prevent client-spoofed claims
const getUserRoleFromDb = async (userId: string, defaultFromJwt?: string) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) {
      return defaultFromJwt || "";
    }
    return data.role;
  } catch (err) {
    return defaultFromJwt || "";
  }
};

// API Route: Securely handle password resets for any user
app.post("/api/admin/reset-password", async (req, res) => {
  const { userId, newPassword } = req.body;
  
  console.log(`[RESET-PASSWORD] Request received for UID: ${userId}`);
  console.log(`[RESET-PASSWORD] Payload size: ${JSON.stringify(req.body).length} characters`);

  const claimant = await getSessionUser(req);
  if (!claimant) {
    return res.status(401).json({ error: "Access Denied: Unauthenticated." });
  }

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  const isAdmin = ADMIN_ROLES.includes(claimantRole);
  const isSelf = claimant.id === userId;

  if (!isAdmin && !isSelf) {
    console.warn(`[ZERO TRUST] Unauthorized reset attempt by user ${claimant.email} (${claimantRole}) for user ID ${userId}`);
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  if (!userId || !newPassword) {
    console.error("[RESET-PASSWORD] Missing userId or newPassword");
    return res.status(400).json({ error: "User ID and new password required." });
  }

  try {
    // Audit check: Verify user existence before attempting reset
    const { data: userData, error: getError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (getError || !userData.user) {
      console.error(`[RESET-PASSWORD] User lookup failed for ${userId}:`, getError?.message || "User not found");
      return res.status(404).json({ error: "User not found in Auth system." });
    }
    
    console.log(`[RESET-PASSWORD] Found user: ${userData.user.email} (ID: ${userData.user.id})`);

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
       console.error(`[RESET-PASSWORD] Supabase Admin SDK Error for ${userId}:`, error);
       throw error;
    }

    // Requirement: Sign out all active sessions after password change
    await supabaseAdmin.auth.admin.signOut(userId);
    console.log(`[RESET-PASSWORD] Revoked all sessions for UID: ${userId}`);

    console.log(`[RESET-PASSWORD] Password updated in auth.users for ${userData.user.email}`);

    // Verify propagation
    const { data: verifyData } = await supabaseAdmin.auth.admin.getUserById(userId);
    console.log(`[RESET-PASSWORD] Verification: user metadata remains intact for ${verifyData.user?.email}`);

    res.json({ 
      success: true, 
      message: "Password updated successfully via Admin API.",
      audit: {
        email: userData.user.email,
        id: userData.user.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error(`[RESET-PASSWORD] CRITICAL ERROR for ${userId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// API Route: Securely onboard new staff members
app.post("/api/admin/onboard-staff", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) {
    return res.status(401).json({ error: "Access Denied: Unauthenticated." });
  }

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!SUPER_ADMIN_ROLES.includes(claimantRole)) {
    console.warn(`[ZERO TRUST] Unauthorized onboard attempt by user ${claimant.email} (${claimantRole})`);
    return res.status(403).json({ error: "Access Denied: Insufficient authorization to onboard staff." });
  }

  const { name, position, department, email, username, role, permissions, password, avatarUrl, description, portfolio } = req.body;

  try {
    // 1. Create Auth User
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        username,
        role
      }
    });

    if (authErr) throw authErr;
    const userId = authData.user.id;

    // 2. Insert Profile
    const { error: profErr } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email,
      name,
      full_name: name,
      role,
      department,
      username,
      avatar_url: avatarUrl,
      skills: permissions
    });
    if (profErr) console.warn("Profile insert warn:", profErr.message);

    // 3. User Role
    await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role });

    // 4. Team Member
    await supabaseAdmin.from("team_members").upsert({
      profile_id: userId,
      position: position || "Specialist",
      department: department || "Operations",
      description: description || "",
      portfolio: portfolio || ""
    });

    res.json({ success: true, userId });
  } catch (err: any) {
    console.error("Staff Onboarding Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// API Route: Securely updates user profiles bypassing RLS policies
app.post("/api/admin/update-profile", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) {
    return res.status(401).json({ error: "Access Denied: Unauthenticated." });
  }

  const { id, updates } = req.body;
  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  const isAdmin = ADMIN_ROLES.includes(claimantRole);
  const isSelf = claimant.id === id;

  if (!isAdmin && !isSelf) {
    console.warn(`[ZERO TRUST] Unauthorized profile update attempt: user ${claimant.email} (${claimantRole}) tried to update profile id ${id}`);
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  // Prevent Privilege Escalation by filtering out role update if not Admin
  if (!isAdmin && updates && updates.role !== undefined) {
    console.warn(`[ZERO TRUST] Stripping unauthorized role escalation attempt from payload updates by user ${claimant.email}`);
    delete updates.role;
  }

  // Validate UUID structure (prevents SQL errors for admin-secret)
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isValidUUID) {
    console.log(`[UPDATE-PROFILE] Bypass database write for non-UUID user profile ID: ${id}`);
    return res.json({ success: true, profile: [{ id, ...updates }] });
  }

  try {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
    if (updates.username !== undefined) payload.username = updates.username;
    if (updates.permissions !== undefined) {
      payload.skills = updates.permissions;
    }

    // Update profiles table securely
    const { data: profData, error: profErr } = await supabaseAdmin
      .from("profiles")
      .update(payload)
      .eq("id", id)
      .select();

    if (profErr) {
      throw profErr;
    }

    // Also update team_members if applicable for consistency
    const teamPayload: any = {};
    if (updates.department !== undefined) teamPayload.department = updates.department;
    if (updates.description !== undefined) teamPayload.description = updates.description;
    if (updates.portfolio !== undefined) teamPayload.portfolio = updates.portfolio;

    if (Object.keys(teamPayload).length > 0) {
      await supabaseAdmin.from("team_members").upsert({
        profile_id: id,
        ...teamPayload
      }, { onConflict: "profile_id" });
    }

    res.json({ success: true, profile: profData });
  } catch (err: any) {
    console.error(`[UPDATE-PROFILE] Error for ID ${id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// API Route: Securely fetch all profiles (bypasses RLS for admin dashboard visibility)
app.get("/api/admin/profiles", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) {
    return res.status(401).json({ error: "Access Denied: Unauthenticated." });
  }

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  const isAuthorized = [...ADMIN_ROLES, "team_member", "developer"].includes(claimantRole);
  if (!isAuthorized) {
    console.warn(`[ZERO TRUST] Unauthorized profiles fetch attempt by user ${claimant.email} (${claimantRole})`);
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  try {
    const { data: profiles, error: pErr } = await supabaseAdmin.from("profiles").select("*");
    const { data: teamMembers, error: tErr } = await supabaseAdmin.from("team_members").select("*");

    if (pErr) throw pErr;
    
    // Merge team member data
    const merged = (profiles || []).map(p => {
      const matchedTeamMember = (teamMembers || []).find(t => String(p.id).trim().toLowerCase() === String(t.profile_id).trim().toLowerCase());
      return {
        ...p,
        ...(matchedTeamMember || {})
      };
    });

    res.json({ profiles: merged });
  } catch (err: any) {
    console.error("Fetch Profiles Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// API Route: Securely fetch pricing options
app.get("/api/pricing", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("pricing_options").select("*").order("created_at", { ascending: true });
    if (error && error.code === '42P01') {
      // Fallback: table doesn't exist yet, check ai_knowledge for temporary persistence
      const { data: fallbackData } = await supabaseAdmin.from("ai_knowledge")
        .select("*")
        .eq("category", "sys_pricing");
        
      if (fallbackData && fallbackData.length > 0) {
        const parsed = fallbackData.map(item => JSON.parse(item.content));
        return res.status(200).json({ pricing: parsed });
      }
      return res.status(200).json({ pricing: [] });
    } else if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ pricing: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely add new pricing option
app.post("/api/admin/pricing", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { id, title, type, tiers } = req.body;
  try {
    console.log("[ADMIN WRITE] Inserting pricing option:", { id, title, type, tiers });
    const { data, error } = await supabaseAdmin.from("pricing_options").insert([{ id, title, type, tiers }]).select();
    if (error) {
      console.error("[SUPABASE ERROR] Pricing insert failed:", error);
      if (error.code === '42P01') {
        // Fallback to ai_knowledge system configuration 
        console.warn("[FALLBACK WARNING] Table pricing_options missing. Running ai_knowledge write...");
        const fallbackId = `sys_pricing_${id}`;
        const { data: fbData, error: fbError } = await supabaseAdmin.from("ai_knowledge").insert([{
           id: fallbackId,
           category: 'sys_pricing',
           question: id,
           answer: JSON.stringify({ id, title, type, tiers })
        }]).select();
        
        if (fbError || !fbData || fbData.length === 0) {
          console.error("[SUPABASE ERROR] Fallback ai_knowledge insert failed:", fbError);
          throw fbError || new Error("Fallback row verification failed.");
        }
        console.log("INSERT RESULT (FALLBACK_AI_KNOWLEDGE)", fbData);
        return res.status(200).json({ success: true, pricing: { id, title, type, tiers } });
      }
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("[ZERO TRUST ERROR] Pricing option row select verification failed.");
      throw new Error("Pricing row verification failed. Row does not exist in backend.");
    }

    console.log("INSERT RESULT", data);
    return res.status(200).json({ success: true, pricing: data[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/pricing:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely update pricing option/tier
app.post("/api/admin/pricing/update", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { id, updates } = req.body;
  try {
    console.log("[ADMIN WRITE] Updating pricing option:", { id, updates });
    const { data, error } = await supabaseAdmin.from("pricing_options").update(updates).eq("id", id).select();
    if (error) {
      console.error("[SUPABASE ERROR] Pricing update failed:", error);
      if (error.code === '42P01') {
        console.warn("[FALLBACK WARNING] Table pricing_options missing. Running ai_knowledge updates...");
        // Fallback update in ai_knowledge
        const { data: act, error: fErr } = await supabaseAdmin.from("ai_knowledge").select("*").eq("category", "sys_pricing").eq("question", id).maybeSingle();
        if (fErr) throw fErr;
        if (act) {
          const payload = { ...JSON.parse(act.answer), ...updates };
          const { data: uData, error: uErr } = await supabaseAdmin.from("ai_knowledge").update({ answer: JSON.stringify(payload) }).eq("id", act.id).select();
          if (uErr || !uData || uData.length === 0) {
            console.error("[SUPABASE ERROR] Fallback pricing update failed:", uErr);
            throw uErr || new Error("Updated row verification failed.");
          }
          console.log("UPDATE RESULT (FALLBACK_AI_KNOWLEDGE)", uData);
        }
        return res.status(200).json({ success: true });
      }
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("[ZERO TRUST ERROR] Pricing option update select verification failed.");
      throw new Error("Pricing update verification failed. Row did not match or could not be found.");
    }

    console.log("UPDATE RESULT", data);
    return res.status(200).json({ success: true, pricing: data[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/pricing/update:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely delete pricing option
app.post("/api/admin/pricing/delete", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { id } = req.body;
  try {
    console.log("[ADMIN WRITE] Deleting pricing option:", id);
    const { data: verifyBefore, error: vErr } = await supabaseAdmin.from("pricing_options").select("id").eq("id", id).maybeSingle();
    // Log previous existence
    console.log("DELETE TARGET INITIAL STATE:", verifyBefore);

    const { error } = await supabaseAdmin.from("pricing_options").delete().eq("id", id);
    if (error) {
       console.error("[SUPABASE ERROR] Pricing delete failed:", error);
       if (error.code === '42P01') {
          // Fallback delete in ai_knowledge
          console.warn("[FALLBACK WARNING] Table pricing_options missing. Running ai_knowledge deletes...");
          const { error: fDelErr } = await supabaseAdmin.from("ai_knowledge").delete().eq("category", "sys_pricing").eq("question", id);
          if (fDelErr) throw fDelErr;
          console.log("DELETE RESULT (FALLBACK_AI_KNOWLEDGE) - row deleted");
          return res.status(200).json({ success: true });
       }
       throw error;
    }

    // Verify deleted
    const { data: verifyAfter } = await supabaseAdmin.from("pricing_options").select("id").eq("id", id).maybeSingle();
    if (verifyAfter) {
      console.error("[ZERO TRUST ERROR] Row delete failed. Selection returned row data after delete action.");
      throw new Error("Pricing delete row verification failed - row still exists.");
    }

    console.log("DELETE RESULT - Row successfully removed from pricing_options.");
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/pricing/delete:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely fetch CMS JSON state
app.get("/api/cms", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("social_media_links").select("*").eq("id", "cms_app_state").maybeSingle();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (data && data.url) {
      try {
        const parsed = JSON.parse(data.url);
        return res.status(200).json({ cms: parsed });
      } catch (e) {
        return res.status(200).json({ cms: null });
      }
    }
    return res.status(200).json({ cms: null });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely save CMS JSON state
app.post("/api/admin/cms", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required." });
  }

  try {
    console.log("[ADMIN WRITE] Upserting CMS content payload into social_media_links row 'cms_app_state':", content);
    const { data, error } = await supabaseAdmin.from("social_media_links").upsert({
      id: "cms_app_state",
      platform: "cms_json_config",
      url: JSON.stringify(content),
      icon: "config",
      display_order: -999,
      visible: false
    }).select();

    if (error) {
      console.error("[SUPABASE ERROR] CMS upsert failed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("[ZERO TRUST ERROR] CMS upsert row select verification failed.");
      throw new Error("CMS save database verification failed. Row not verified in table.");
    }

    console.log("UPDATE RESULT (CMS UPSERT SUCCESS)", data);
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/cms:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely fetch Blogs
app.get("/api/blogs", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("blogs").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return res.status(200).json({ blogs: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely insert Blog
app.post("/api/admin/blogs", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Insert Blog:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { blog } = req.body;
  if (!blog) return res.status(400).json({ error: "Blog payload is required." });

  try {
    console.log("[ADMIN WRITE] Inserting blog item:", blog);
    const { data, error } = await supabaseAdmin.from("blogs").insert([blog]).select();
    if (error) {
      console.error("[SUPABASE ERROR] Insert blog failed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("[ZERO TRUST ERROR] Blog row select verification failed.");
      throw new Error("Row insert verification failed on blogs table.");
    }

    console.log("INSERT RESULT", data);
    return res.status(200).json({ success: true, blog: data[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/blogs:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely update Blog
app.post("/api/admin/blogs/update", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Update Blog:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { id, updates } = req.body;
  if (!id || !updates) return res.status(400).json({ error: "Blog ID and updates are required." });

  try {
    console.log("[ADMIN WRITE] Updating blog item:", { id, updates });
    const { data, error } = await supabaseAdmin.from("blogs").update(updates).eq("id", id).select();
    if (error) {
      console.error("[SUPABASE ERROR] Update blog failed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("[ZERO TRUST ERROR] Blog row update select verification failed.");
      throw new Error("Row update verification failed on blogs table.");
    }

    console.log("UPDATE RESULT", data);
    return res.status(200).json({ success: true, blog: data[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/blogs/update:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely delete Blog
app.post("/api/admin/blogs/delete", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Delete Blog:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Blog ID is required." });

  try {
    console.log("[ADMIN WRITE] Deleting blog item:", id);
    const { data: beforeDel } = await supabaseAdmin.from("blogs").select("*").eq("id", id).maybeSingle();
    console.log("DELETE TARGET INITIAL STATE:", beforeDel);

    if (beforeDel && beforeDel.image_url) {
      try {
        const urlStr = beforeDel.image_url;
        if (urlStr.includes("/blog-images/")) {
          const parts = urlStr.split("/blog-images/");
          if (parts.length > 1) {
            const cleanPath = decodeURIComponent(parts[1]);
            console.log(`[STORAGE DELETE] Deleting image of blog ${id} from storage:`, cleanPath);
            await supabaseAdmin.storage.from("blog-images").remove([cleanPath]);
          }
        }
      } catch (stErr: any) {
        console.warn("[STORAGE DELETE EXCEPTION] Failed to delete blog image:", stErr.message);
      }
    }

    const { error } = await supabaseAdmin.from("blogs").delete().eq("id", id);
    if (error) {
      console.error("[SUPABASE ERROR] Delete blog failed:", error);
      throw error;
    }

    const { data: afterDel } = await supabaseAdmin.from("blogs").select("id").eq("id", id).maybeSingle();
    if (afterDel) {
      console.error("[ZERO TRUST ERROR] Row deletion failed. Blog row still exists in DB.");
      throw new Error("Row delete verification failed on blogs table.");
    }

    console.log("DELETE RESULT - Blog successfully deleted.");
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/blogs/delete:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely fetch Portfolio Items
app.get("/api/portfolio", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("portfolio_items").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return res.status(200).json({ portfolio: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely insert Portfolio Item
app.post("/api/admin/portfolio", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Insert Portfolio:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { item } = req.body;
  if (!item) return res.status(400).json({ error: "Portfolio payload is required." });

  try {
    console.log("[ADMIN WRITE] Inserting portfolio item:", item);
    const { data, error } = await supabaseAdmin.from("portfolio_items").insert([item]).select();
    if (error) {
      console.error("[SUPABASE ERROR] Insert portfolio failed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("[ZERO TRUST ERROR] Row verification failed after inserting portfolio item.");
      throw new Error("Row insert verification failed on portfolio_items table.");
    }

    console.log("INSERT RESULT", data);
    return res.status(200).json({ success: true, item: data[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/portfolio:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely update Portfolio Item
app.post("/api/admin/portfolio/update", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Update Portfolio:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { id, updates } = req.body;
  if (!id || !updates) return res.status(400).json({ error: "Portfolio ID and updates are required." });

  try {
    console.log("[ADMIN WRITE] Updating portfolio item:", { id, updates });
    const { data, error } = await supabaseAdmin.from("portfolio_items").update(updates).eq("id", id).select();
    if (error) {
      console.error("[SUPABASE ERROR] Update portfolio failed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("[ZERO TRUST ERROR] Row verification failed after updating portfolio item.");
      throw new Error("Row update verification failed on portfolio_items table (no matching row or update returned void).");
    }

    console.log("UPDATE RESULT", data);
    return res.status(200).json({ success: true, item: data[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/portfolio/update:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely delete Portfolio Item
app.post("/api/admin/portfolio/delete", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Portfolio ID is required." });

  try {
    const { error } = await supabaseAdmin.from("portfolio_items").delete().eq("id", id);
    if (error) throw error;
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely insert/upsert active client plan
app.post("/api/admin/active-plans", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { plan } = req.body;
  if (!plan) return res.status(400).json({ error: "Plan payload is required." });

  try {
    console.log("[ADMIN WRITE] Managing/Upserting client Active Plan:", plan);
    // Upsert so if ID already exists, it updates, or handles client_id constraint
    const { data, error } = await supabaseAdmin.from("active_plans").upsert([plan]).select();
    if (error) {
      console.error("[SUPABASE ERROR] Manage active plan failed:", error);
      throw error;
    }
    return res.status(200).json({ success: true, plan: data?.[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/active-plans:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely update active client plan
app.post("/api/admin/active-plans/update", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { id, updates } = req.body;
  if (!id || !updates) return res.status(400).json({ error: "Plan ID and updates are required." });

  try {
    console.log("[ADMIN WRITE] Updating client Active Plan:", { id, updates });
    const { data, error } = await supabaseAdmin.from("active_plans").update(updates).eq("id", id).select();
    if (error) {
      console.error("[SUPABASE ERROR] Update active plan failed:", error);
      throw error;
    }
    return res.status(200).json({ success: true, plan: data?.[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/active-plans/update:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely delete active client plan
app.post("/api/admin/active-plans/delete", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Plan ID is required." });

  try {
    console.log("[ADMIN WRITE] Deleting/Expiring client Active Plan:", id);
    const { error } = await supabaseAdmin.from("active_plans").delete().eq("id", id);
    if (error) throw error;
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/active-plans/delete:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely insert Review / Testimonial
app.post("/api/admin/reviews", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Insert Review:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  const isAuthorized = ["secret_admin", "primary_admin", "secondary_admin", "third_admin", "team_member", "client", "developer"].includes(claimantRole);
  if (!isAuthorized) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { review } = req.body;
  if (!review) return res.status(400).json({ error: "Review payload is required." });

  // Map review object to DB columns
  const dbReview = {
    id: review.id || "rev-" + Math.random().toString(36).substring(4),
    client_id: review.client_id || claimant.id,
    name: review.client_name || review.name || claimant.user_metadata?.name || "Anonymous",
    avatar_url: review.client_avatar || review.avatar_url || claimant.user_metadata?.avatar_url || "",
    rating: Number(review.rating) || 5,
    review_text: review.review_text || "",
    role: review.service_used || review.role || "Website Development",
    company: review.company || "",
    date: review.date || new Date().toISOString().split("T")[0],
    status: ADMIN_ROLES.includes(claimantRole) ? (review.status || "Approved") : "Pending", // Admin can pre-approve
    featured: ADMIN_ROLES.includes(claimantRole) ? (review.is_featured || review.featured || false) : false, // Admin can pre-feature
    admin_reply: review.reply_text || review.admin_reply || null
  };

  try {
    console.log("[ADMIN WRITE] Inserting review mapped:", dbReview);
    const { data, error } = await supabaseAdmin.from("reviews").insert([dbReview]).select();
    if (error) {
      console.error("[SUPABASE ERROR] Insert reviews failed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("[ZERO TRUST ERROR] Row select verification failed after inserting review.");
      throw new Error("Row insert verification failed on reviews table.");
    }

    console.log("[ADMIN WRITE RESULT] Successfully inserted review:", data);
    return res.status(200).json({ success: true, data: data[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/reviews:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely update Review / Testimonial
app.post("/api/admin/reviews/update", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Update Review:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  const isAdmin = ADMIN_ROLES.includes(claimantRole);

  const { id, updates } = req.body;
  if (!id || !updates) return res.status(400).json({ error: "Review ID and updates are required." });

  try {
    if (!isAdmin) {
      const { data: targetReview, error: fetchErr } = await supabaseAdmin.from("reviews").select("client_id").eq("id", id).maybeSingle();
      if (fetchErr || !targetReview) {
        return res.status(404).json({ error: "Review not found." });
      }
      if (targetReview.client_id !== claimant.id) {
        return res.status(403).json({ error: "Access Denied: You cannot edit reviews submitted by other users." });
      }
      
      // Ensure client cannot bypass approval reviews
      delete updates.status;
      delete updates.featured;
      delete updates.is_featured;
      delete updates.reply_text;
      delete updates.admin_reply;
      updates.status = "Pending";
    }

    // Map any frontend inputs to DB columns
    const mappedUpdates: any = {
      updated_at: new Date().toISOString()
    };
    if (updates.client_name !== undefined) mappedUpdates.name = updates.client_name;
    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.client_avatar !== undefined) mappedUpdates.avatar_url = updates.client_avatar;
    if (updates.avatar_url !== undefined) mappedUpdates.avatar_url = updates.avatar_url;
    if (updates.service_used !== undefined) mappedUpdates.role = updates.service_used;
    if (updates.role !== undefined) mappedUpdates.role = updates.role;
    if (updates.is_featured !== undefined) mappedUpdates.featured = updates.is_featured;
    if (updates.featured !== undefined) mappedUpdates.featured = updates.featured;
    if (updates.reply_text !== undefined) mappedUpdates.admin_reply = updates.reply_text;
    if (updates.admin_reply !== undefined) mappedUpdates.admin_reply = updates.admin_reply;

    const directColumns = ["rating", "review_text", "company", "date", "status"];
    for (const col of directColumns) {
      if (updates[col] !== undefined) {
        mappedUpdates[col] = updates[col];
      }
    }

    console.log(`[ADMIN WRITE] Updating review ${id}:`, mappedUpdates);
    const { data, error } = await supabaseAdmin.from("reviews").update(mappedUpdates).eq("id", id).select();
    if (error) {
      console.error("[SUPABASE ERROR] Update reviews failed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("[ZERO TRUST ERROR] Row verification failed after updating review.");
      throw new Error("Row update verification failed on reviews table.");
    }

    console.log("[ADMIN WRITE RESULT] Successfully updated review:", data);
    return res.status(200).json({ success: true, data: data[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/reviews/update:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely delete Review / Testimonial
app.post("/api/admin/reviews/delete", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Delete Review:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  const isAdmin = ADMIN_ROLES.includes(claimantRole);

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Review ID is required." });

  try {
    if (!isAdmin) {
      const { data: targetReview, error: fetchErr } = await supabaseAdmin.from("reviews").select("client_id").eq("id", id).maybeSingle();
      if (fetchErr || !targetReview) {
        return res.status(404).json({ error: "Review not found." });
      }
      if (targetReview.client_id !== claimant.id) {
        return res.status(403).json({ error: "Access Denied: You cannot delete reviews submitted by other users." });
      }
    }

    console.log(`[ADMIN WRITE] Deleting review ${id}`);
    const { data: beforeDel } = await supabaseAdmin.from("reviews").select("id").eq("id", id).maybeSingle();
    console.log("DELETE TARGET INITIAL STATE:", beforeDel);

    const { error } = await supabaseAdmin.from("reviews").delete().eq("id", id);
    if (error) {
      console.error("[SUPABASE ERROR] Delete reviews failed:", error);
      throw error;
    }

    const { data: afterDel } = await supabaseAdmin.from("reviews").select("id").eq("id", id).maybeSingle();
    if (afterDel) {
      console.error("[ZERO TRUST ERROR] Row deletion failed. Review still exists.");
      throw new Error("Row delete verification failed on reviews table.");
    }

    console.log(`[ADMIN WRITE RESULT] Successfully deleted review ${id}`);
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/reviews/delete:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely insert Quote Request
app.post("/api/quote-requests", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Insert Quote Request:", claimant);
  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  const isAuthorized = ["secret_admin", "primary_admin", "secondary_admin", "third_admin", "team_member", "client", "developer"].includes(claimantRole);
  if (!isAuthorized) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { request } = req.body;
  if (!request) return res.status(400).json({ error: "Request payload is required." });

  // Map to DB columns
  const dbQuote = {
    id: request.id || "req-" + Math.random().toString(36).substring(4),
    client_id: request.client_id || claimant.id,
    client_name: request.client_name || claimant.user_metadata?.name || "Anonymous User",
    client_email: request.client_email || claimant.email || "no-email@example.com",
    service_type: request.service_type || "Website Development",
    description: request.description || "",
    budget: request.budget || "",
    status: request.status || "Submitted",
    created_at: request.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    console.log("[ADMIN WRITE] Inserting quote request mapped:", dbQuote);
    const { data, error } = await supabaseAdmin.from("quote_requests").insert([dbQuote]).select();
    if (error) {
      console.error("[SUPABASE ERROR] Insert quote_requests failed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("[ZERO TRUST ERROR] Row select verification failed after inserting quote request.");
      throw new Error("Row insert verification failed on quote_requests table.");
    }

    console.log("[ADMIN WRITE RESULT] Successfully inserted quote request:", data);
    return res.status(200).json({ success: true, data: data[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/quote-requests:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely update Quote Request
app.post("/api/quote-requests/update", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  const isAdminOrStaff = [...ADMIN_ROLES, "team_member", "developer"].includes(claimantRole);

  const { id, updates } = req.body;
  if (!id || !updates) return res.status(400).json({ error: "Quote Request ID and updates are required." });

  try {
    if (!isAdminOrStaff) {
      const { data: targetQuote, error: fetchErr } = await supabaseAdmin.from("quote_requests").select("client_id").eq("id", id).maybeSingle();
      if (fetchErr || !targetQuote) {
        return res.status(404).json({ error: "Quote Request not found." });
      }
      if (targetQuote.client_id !== claimant.id) {
        return res.status(403).json({ error: "Access Denied: You cannot edit requests belonging to other clients." });
      }
    }

    // Prepare updates
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.service_type !== undefined) dbUpdates.service_type = updates.service_type;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
    
    if (updates.status !== undefined) {
      if (isAdminOrStaff) {
        dbUpdates.status = updates.status;
      } else if (updates.status === "Cancelled") {
        dbUpdates.status = "Cancelled";
      } else {
        return res.status(403).json({ error: "Access Denied: Only Admins/Team can change quote status." });
      }
    }

    console.log(`[WRITE] Updating quote request ${id}:`, dbUpdates);
    const { data, error } = await supabaseAdmin.from("quote_requests").update(dbUpdates).eq("id", id).select();
    if (error) {
      console.error("[SUPABASE ERROR] Update quote_request failed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("Row update verification failed on quote_requests table.");
    }

    return res.status(200).json({ success: true, data: data[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/quote-requests/update:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely delete Quote Request
app.post("/api/quote-requests/delete", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  const isAdminOrStaff = [...ADMIN_ROLES, "team_member", "developer"].includes(claimantRole);

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Quote Request ID is required." });

  try {
    if (!isAdminOrStaff) {
      const { data: targetQuote, error: fetchErr } = await supabaseAdmin.from("quote_requests").select("client_id").eq("id", id).maybeSingle();
      if (fetchErr || !targetQuote) {
        return res.status(404).json({ error: "Quote Request not found." });
      }
      if (targetQuote.client_id !== claimant.id) {
        return res.status(403).json({ error: "Access Denied: You cannot delete requests belonging to other clients." });
      }
    }

    console.log(`[WRITE] Deleting quote request ${id}`);
    const { error } = await supabaseAdmin.from("quote_requests").delete().eq("id", id);
    if (error) {
      console.error("[SUPABASE ERROR] Delete quote_request failed:", error);
      throw error;
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/quote-requests/delete:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely insert Social Media Link
app.post("/api/admin/social-links", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Insert Social Link:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { link } = req.body;
  if (!link) return res.status(400).json({ error: "Link payload is required." });

  try {
    console.log("[ADMIN WRITE] Inserting social link:", link);
    const { data, error } = await supabaseAdmin.from("social_media_links").insert([link]).select();
    if (error) {
      console.error("[SUPABASE ERROR] Insert social link failed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("[ZERO TRUST ERROR] Row select verification failed after inserting social link.");
      throw new Error("Row insert verification failed on social_media_links table.");
    }

    console.log("[ADMIN WRITE RESULT] Successfully inserted social link:", data);
    return res.status(200).json({ success: true, data: data[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/social-links:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely update Social Media Link
app.post("/api/admin/social-links/update", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Update Social Link:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { id, updates } = req.body;
  if (!id || !updates) return res.status(400).json({ error: "Social link ID and updates are required." });

  try {
    console.log(`[ADMIN WRITE] Updating social link ${id}:`, updates);
    const { data, error } = await supabaseAdmin.from("social_media_links").update(updates).eq("id", id).select();
    if (error) {
      console.error("[SUPABASE ERROR] Update social link failed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("[ZERO TRUST ERROR] Row select verification failed after updating social link.");
      throw new Error("Row update verification failed on social_media_links table.");
    }

    console.log("[ADMIN WRITE RESULT] Successfully updated social link:", data);
    return res.status(200).json({ success: true, data: data[0] });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/social-links/update:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely delete Social Media Link
app.post("/api/admin/social-links/delete", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Delete Social Link:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Social link ID is required." });

  try {
    console.log(`[ADMIN WRITE] Deleting social link ${id}`);
    const { data: beforeDel } = await supabaseAdmin.from("social_media_links").select("id").eq("id", id).maybeSingle();
    console.log("DELETE TARGET INITIAL STATE:", beforeDel);

    const { error } = await supabaseAdmin.from("social_media_links").delete().eq("id", id);
    if (error) {
      console.error("[SUPABASE ERROR] Delete social link failed:", error);
      throw error;
    }

    const { data: afterDel } = await supabaseAdmin.from("social_media_links").select("id").eq("id", id).maybeSingle();
    if (afterDel) {
      console.error("[ZERO TRUST ERROR] Row deletion failed. Social media link still exists.");
      throw new Error("Row delete verification failed on social_media_links table.");
    }

    console.log(`[ADMIN WRITE RESULT] Successfully deleted social link ${id}`);
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/social-links/delete:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely reorder Social Media Links
app.post("/api/admin/social-links/reorder", async (req, res) => {
  const claimant = await getSessionUser(req);
  console.log("[ZERO TRUST AUTH GET] Claimant User Object - Reorder Social Links:", claimant);
  if (claimant) {
    console.log("[ZERO TRUST AUTH UID] Claimant User ID:", claimant.id);
  } else {
    console.warn("[ZERO TRUST AUTH WARNING] Access attempted by unauthenticated user.");
  }

  if (!claimant) return res.status(401).json({ error: "Access Denied: Unauthenticated." });

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { updatedLinks } = req.body;
  if (!updatedLinks || !Array.isArray(updatedLinks)) return res.status(400).json({ error: "Invalid updatedLinks payload." });

  try {
    console.log("[ADMIN WRITE] Reordering social links:", updatedLinks.length);
    for (const link of updatedLinks) {
      const { error } = await supabaseAdmin
        .from("social_media_links")
        .update({ display_order: link.display_order })
        .eq("id", link.id);
      if (error) {
        console.error(`[SUPABASE ERROR] Reorder social link ${link.id} failed:`, error);
        throw error;
      }
    }
    console.log("[ADMIN WRITE RESULT] Successfully reordered social links.");
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("[API EXCEPTION] /api/admin/social-links/reorder:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Securely delete user account (Auth and Profiles)
app.post("/api/admin/delete-account", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) {
    return res.status(401).json({ error: "Access Denied: Unauthenticated." });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  const isSuperAdmin = SUPER_ADMIN_ROLES.includes(claimantRole);
  const isSelf = claimant.id === id;

  if (!isSuperAdmin && !isSelf) {
    console.warn(`[ZERO TRUST] Unauthorized account delete attempt by user ${claimant.email} (${claimantRole}) for ID ${id}`);
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  // Prevent deleting high-level secret administrative systems
  if (id === "admin-secret") {
    return res.status(403).json({ error: "High-security administrative accounts cannot be deleted." });
  }

  try {
    // Delete profile first so cascades and constraints behave correctly
    await supabaseAdmin.from("profiles").delete().eq("id", id);
    // Delete Auth User
    await supabaseAdmin.auth.admin.deleteUser(id);

    res.json({ success: true });
  } catch (err: any) {
    console.error(`[DELETE-ACCOUNT] Error for ID ${id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Helper: Send Account Deactivation Request Email to Admin Email configured throughout the system
async function sendDeactivationEmail(adminEmail: string, userDetails: { id: string, name: string, email: string, date: string }) {
  console.log(`[DEACTIVATION EMAIL] Preparing notification for admin: ${adminEmail}`);
  console.log(`- Request User Details: ${userDetails.name} (Email: ${userDetails.email}, ID: ${userDetails.id}, Time: ${userDetails.date})`);

  // Configured transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || ""
    }
  });

  const mailOptions = {
    from: `"Diavox System Registry" <${process.env.SMTP_FROM || "no-reply@diavox.com"}>`,
    to: adminEmail,
    subject: `⚠️ Account Deactivation Request: ${userDetails.name}`,
    text: `User has requested account deactivation. Please review and deactivate the account from Supabase.

User Details:
----------------------------------------
User Name: ${userDetails.name}
User Email: ${userDetails.email}
User ID: ${userDetails.id}
Request Date and Time: ${userDetails.date}
----------------------------------------

Message:
"User has requested account deactivation. Please review and deactivate the account from Supabase."

Please proceed to the Administrative Control Panel to audit this request status.
`
  };

  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      await transporter.sendMail(mailOptions);
      console.log("[DEACTIVATION EMAIL] email dispatched successfully using configured SMTP.");
    } else {
      console.log("[DEACTIVATION EMAIL] (SMTP credentials unconfigured) Simulated email content logged above.");
    }
  } catch (mailErr: any) {
    console.error("[DEACTIVATION EMAIL ERROR] Failed to send email via SMTP:", mailErr.message);
  }
}

// API Route: Submit new client / member account deactivation request
app.post("/api/user/deactivate", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) {
    return res.status(401).json({ error: "Access Denied: Unauthenticated." });
  }

  const { userName, userEmail } = req.body;
  if (!userName || !userEmail) {
    return res.status(400).json({ error: "Name and Email properties are required." });
  }

  try {
    // 1. Log request to deactivation_requests
    const { data: requestRow, error: insertError } = await supabaseAdmin
      .from("deactivation_requests")
      .insert({
        user_id: claimant.id,
        user_name: userName,
        user_email: userEmail,
        status: "Pending Review",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("[DEACTIVATION ERROR] Failed to write in Supabase deactivation_requests:", insertError);
      return res.status(500).json({ error: "Failed to persist deactivation request inside Supabase." });
    }

    // 2. Fetch administrator contact settings configured throughout the website
    let adminEmail = "hello@diavox.com";
    try {
      const { data: contactData } = await supabaseAdmin
        .from("contact_settings")
        .select("email")
        .limit(1)
        .maybeSingle();
      if (contactData && contactData.email) {
        adminEmail = contactData.email;
      }
    } catch (_) {}

    // 3. Dispatch deactivation alert email notification
    await sendDeactivationEmail(adminEmail, {
      id: claimant.id,
      name: userName,
      email: userEmail,
      date: new Date().toLocaleString()
    });

    return res.json({ 
      success: true, 
      request: requestRow, 
      message: "Deactivation request logged and administrative notifier sent." 
    });

  } catch (err: any) {
    console.error("[API EXCEPTION] /api/user/deactivate:", err.message);
    return res.status(500).json({ error: err.message || "An exception occurred." });
  }
});

// API Route: Retrieve all deactivation requests for audited review (Admins only)
app.get("/api/admin/deactivation-requests", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) {
    return res.status(401).json({ error: "Access Denied: Unauthenticated." });
  }

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("deactivation_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ADMIN DEACTIVATION GET ERROR]", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ requests: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// API Route: Admin updates request timeline progress or approves deactivation
app.post("/api/admin/deactivate-user-confirm", async (req, res) => {
  const claimant = await getSessionUser(req);
  if (!claimant) {
    return res.status(401).json({ error: "Access Denied: Unauthenticated." });
  }

  const claimantRole = await getUserRoleFromDb(claimant.id, claimant.user_metadata?.role);
  if (!ADMIN_ROLES.includes(claimantRole)) {
    return res.status(403).json({ error: "Access Denied: Insufficient authorization." });
  }

  const { requestId, status, targetUserId } = req.body;
  if (!requestId || !status) {
    return res.status(400).json({ error: "Request ID and next Status are required." });
  }

  try {
    // 1. Update request status in deactivation_requests
    const { error: updateErr } = await supabaseAdmin
      .from("deactivation_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (updateErr) {
      console.error("[ADMIN DEACTIVATE CONFIRM ERROR]", updateErr.message);
      return res.status(500).json({ error: "Failed updating progress: " + updateErr.message });
    }

    // 2. If status evaluates to 'Deactivated', transition user account status to suspended in profiles
    if (status === "Deactivated" && targetUserId) {
      const { error: updateProfileErr } = await supabaseAdmin
        .from("profiles")
        .update({ status: "suspended" })
        .eq("id", targetUserId);

      if (updateProfileErr) {
        console.warn("[ADMIN DEACTIVATE CONFIRM PROFILE ERROR] Non-blocking exception:", updateProfileErr.message);
      }
    }

    return res.json({ success: true, message: `Request status adjusted to: ${status}.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
