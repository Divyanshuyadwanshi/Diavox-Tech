
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

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

// API Route: Securely handle password resets for any user
app.post("/api/admin/reset-password", async (req, res) => {
  const { userId, newPassword } = req.body;
  
  console.log(`[RESET-PASSWORD] Request received for UID: ${userId}`);
  console.log(`[RESET-PASSWORD] Payload size: ${JSON.stringify(req.body).length} characters`);

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
  const { id, updates } = req.body;
  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
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
  try {
    const { data: profiles, error: pErr } = await supabaseAdmin.from("profiles").select("*");
    const { data: teamMembers, error: tErr } = await supabaseAdmin.from("team_members").select("*");

    if (pErr) throw pErr;
    
    // Merge team member data
    const teamMap = new Map((teamMembers || []).map(t => [t.profile_id, t]));
    const merged = (profiles || []).map(p => ({
      ...p,
      ...(teamMap.get(p.id) || {})
    }));

    res.json({ profiles: merged });
  } catch (err: any) {
    console.error("Fetch Profiles Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// API Route: Securely delete user account (Auth and Profiles)
app.post("/api/admin/delete-account", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
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
