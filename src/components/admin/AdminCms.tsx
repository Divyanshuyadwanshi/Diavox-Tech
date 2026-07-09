import React, { useState, useEffect } from "react";
import { useStore } from "../../store";
import { 
  Layout, Save, GripVertical, ChevronUp, ChevronDown, Eye, EyeOff,
  HelpCircle, Plus, Trash2, Edit2, Check, RefreshCw, Layers, Laptop,
  Settings, Bot, Download, Phone, Mail, Clock, Palette, Type, AlertCircle, Heart,
  Zap, X, Inbox 
} from "lucide-react";
import { CmsContent } from "../../types";

// Dynamic landing preview component imports
import Hero from "../Hero";
import Services from "../Services";
import Portfolio from "../Portfolio";
import Team from "../Team";
import Pricing from "../Pricing";
import Blog from "../Blog";
import Reviews from "../Reviews";
import Contact from "../Contact";

export default function AdminCms() {
  const { theme, currentUser, cmsContent, updateCmsContent, addActivityLog } = useStore();
  
  // Local active sub-tab: "hero_layout" | "branding" | "services" | "faqs" | "contact" | "custom_sections" | "interactive_3d" | "hero_slider"
  const [subTab, setSubTab] = useState<"hero_layout" | "branding" | "services" | "faqs" | "contact" | "custom_sections" | "interactive_3d" | "hero_slider">("hero_layout");
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  // Hero Slider Config
  const [sliderConfig, setSliderConfig] = useState({
    autoplay: true,
    duration: 3000,
    globalEffect: "fade"
  });
  const [heroSlides, setHeroSlides] = useState<any[]>([]);

  // 0. Interactive 3D Sphere Config
  const [sphereColor, setSphereColor] = useState<string>("");
  const [sphereSize, setSphereSize] = useState<number>(0.42);
  const [sphereLabels, setSphereLabels] = useState<string[]>([]);
  const [sparkEnabled, setSparkEnabled] = useState<boolean>(true);
  const [sparkFreq, setSparkFreq] = useState<number>(0.05);
  const [sphereRotation, setSphereRotation] = useState<number>(0.25);
  const [sphereRings, setSphereRings] = useState<number>(5);
  const [sphereSegments, setSphereSegments] = useState<number>(12);

  const showToast = (msg: string) => {
    setSuccessAlert(msg);
    setTimeout(() => setSuccessAlert(null), 3000);
  };

  const showErrorToast = (msg: string) => {
    setErrorAlert(msg);
    setTimeout(() => setErrorAlert(null), 5000);
  };

  // 1. HERO & SEQUENCE STATES
  const [heroBadge, setHeroBadge] = useState<string>(cmsContent?.heroBadge || "");
  const [heroBadgeEffect, setHeroBadgeEffect] = useState<"spin" | "pulse" | "ping" | "none" | "hide">(cmsContent?.heroBadgeEffect || "spin");
  const [heroTitle, setHeroTitle] = useState<string>(cmsContent?.heroTitle || "");
  const [heroSubtitle, setHeroSubtitle] = useState<string>(cmsContent?.heroSubtitle || "");
  const [sectionsOrder, setSectionsOrder] = useState<string[]>([]);
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // NEW BRANDING, FONTS, HEADER AND FOOTER STATE HOOKS
  const [fontSans, setFontSans] = useState<string>("");
  const [defaultCurrency, setDefaultCurrency] = useState<string>("USD");
  const [fontDisplay, setFontDisplay] = useState<string>("");
  const [fontMono, setFontMono] = useState<string>("");

  const [headerLogoTitle, setHeaderLogoTitle] = useState<string>("");
  const [headerLogoAccent, setHeaderLogoAccent] = useState<string>("");
  const [headerLogoSubtitle, setHeaderLogoSubtitle] = useState<string>("");

  const [heroCtaPrimaryText, setHeroCtaPrimaryText] = useState<string>("");
  const [heroCtaSecondaryText, setHeroCtaSecondaryText] = useState<string>("");

  const [footerLogoText, setFooterLogoText] = useState<string>("");
  const [footerLogoAccent, setFooterLogoAccent] = useState<string>("");
  const [footerBrandDesc, setFooterBrandDesc] = useState<string>("");
  const [footerCopyright, setFooterCopyright] = useState<string>("");
  const [footerCredit, setFooterCredit] = useState<string>("");
  const [footerNotation1, setFooterNotation1] = useState<string>("");
  const [footerNotation2, setFooterNotation2] = useState<string>("");

  // Sync initial content
  useEffect(() => {
    if (cmsContent) {
      setHeroBadge(cmsContent.heroBadge || "");
      setHeroBadgeEffect(cmsContent.heroBadgeEffect || "spin");
      setHeroTitle(cmsContent.heroTitle || "");
      setHeroSubtitle(cmsContent.heroSubtitle || "");
      setSectionsOrder(cmsContent.homepageSections || ["hero", "services", "portfolio", "team", "reviews", "pricing", "blog", "contact"]);
      setSectionVisibility(cmsContent.sectionVisibility || {
        hero: true,
        services: true,
        portfolio: true,
        team: true,
        reviews: true,
        pricing: true,
        blog: true,
        contact: true
      });
      setFontSans(cmsContent.fontSans || "Inter");
      setDefaultCurrency(cmsContent.defaultCurrency || "USD");
      setFontDisplay(cmsContent.fontDisplay || "Space Grotesk");
      setFontMono(cmsContent.fontMono || "JetBrains Mono");
      setHeaderLogoTitle(cmsContent.headerLogoTitle || "Diavox");
      setHeaderLogoAccent(cmsContent.headerLogoAccent || "Tech");
      setHeaderLogoSubtitle(cmsContent.headerLogoSubtitle || "GLOBAL REMOTE");
      setHeroCtaPrimaryText(cmsContent.heroCtaPrimaryText || "Request Custom Quote");
      setHeroCtaSecondaryText(cmsContent.heroCtaSecondaryText || "Explore Work");
      setFooterLogoText(cmsContent.footerLogoText || "Diavox");
      setFooterLogoAccent(cmsContent.footerLogoAccent || "Tech");
      setFooterBrandDesc(cmsContent.footerBrandDesc || '"Building Digital Experiences, Automating Businesses, Driving Growth." Crafting sub-second applications, custom automated CRM logic, and technical SEO algorithms.');
      setFooterCopyright(cmsContent.footerCopyright || "© 2026 Diavox Tech Inc. Serving global remote divisions. All rights reserved.");
      setFooterCredit(cmsContent.footerCredit || "Made with precision by Diavox Desk");
      setFooterNotation1(cmsContent.footerNotation1 || "Serving clients worldwide remotely.");
      setFooterNotation2(cmsContent.footerNotation2 || "Customer support available with responses within 24 hours.");
      if (cmsContent.sphereConfig) {
        setSphereColor(cmsContent.sphereConfig.color);
        setSphereSize(cmsContent.sphereConfig.size);
        setSphereLabels(cmsContent.sphereConfig.labels || []);
        setSparkEnabled(cmsContent.sphereConfig.sparkEnabled !== false);
        setSparkFreq(cmsContent.sphereConfig.sparkFrequency || 0.05);
        setSphereRotation(cmsContent.sphereConfig.rotationSpeed || 0.25);
        setSphereRings(cmsContent.sphereConfig.rings || 5);
        setSphereSegments(cmsContent.sphereConfig.segments || 12);
      }
      if (cmsContent.heroSliderConfig) {
        setSliderConfig(cmsContent.heroSliderConfig as any);
      }
      if (cmsContent.heroSlides) {
        setHeroSlides(cmsContent.heroSlides);
      }
    }
  }, [cmsContent]);

  // 2. BRANDING STATES
  const [sectTitles, setSectTitles] = useState<Record<string, string>>({});
  const [sectSubtitles, setSectSubtitles] = useState<Record<string, string>>({});
  const [sectDescriptions, setSectDescriptions] = useState<Record<string, string>>({});
  const [sectColors, setSectColors] = useState<Record<string, { bg: string; text: string }>>({});

  useEffect(() => {
    if (cmsContent) {
      setSectTitles(cmsContent.sectionTitles || {});
      setSectSubtitles(cmsContent.sectionSubtitles || {});
      setSectDescriptions(cmsContent.sectionDescriptions || {});
      setSectColors(cmsContent.sectionColors || {});
    }
  }, [cmsContent]);

  // 3. SERVICES STATES
  const [services, setServices] = useState<Array<{ id: string; title: string; description: string; icon: string }>>([]);
  const [newSvcTitle, setNewSvcTitle] = useState<string>("");
  const [newSvcDesc, setNewSvcDesc] = useState<string>("");
  const [newSvcIcon, setNewSvcIcon] = useState<string>("Laptop");
  const [editingSvcId, setEditingSvcId] = useState<string | null>(null);

  useEffect(() => {
    if (cmsContent && cmsContent.services) {
      setServices(cmsContent.services);
    }
  }, [cmsContent]);

  // 4. FAQS STATES
  const [faqs, setFaqs] = useState<Array<{ id: string; question: string; answer: string }>>([]);
  const [newFaqQ, setNewFaqQ] = useState<string>("");
  const [newFaqA, setNewFaqA] = useState<string>("");
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingFaqQ, setEditingFaqQ] = useState<string>("");
  const [editingFaqA, setEditingFaqA] = useState<string>("");

  // 4b. CUSTOM SECTIONS STATES
  const [customSections, setCustomSections] = useState<any[]>([]);
  const [csTitle, setCsTitle] = useState<string>("");
  const [csSubtitle, setCsSubtitle] = useState<string>("");
  const [csDescription, setCsDescription] = useState<string>("");
  const [csContent, setCsContent] = useState<string>("");
  const [csPosition, setCsPosition] = useState<"Header" | "Body" | "Footer">("Body");
  const [csBgColor, setCsBgColor] = useState<string>("#0f172a");
  const [csTextColor, setCsTextColor] = useState<string>("#ffffff");
  const [csVisible, setCsVisible] = useState<boolean>(true);
  const [editingCsId, setEditingCsId] = useState<string | null>(null);

  useEffect(() => {
    if (cmsContent && cmsContent.faqs) {
      setFaqs(cmsContent.faqs);
    }
    if (cmsContent && cmsContent.customSections) {
      setCustomSections(cmsContent.customSections);
    }
  }, [cmsContent]);

  // 5. CONTACT STATES
  const [cWhatsapp, setCWhatsapp] = useState<string>("");
  const [cEmail, setCEmail] = useState<string>("");
  const [cPhone, setCPhone] = useState<string>("");
  const [cSupportEmail, setCSupportEmail] = useState<string>("");
  const [cBusinessHours, setCBusinessHours] = useState<string>("");
  const [cFacebook, setCFacebook] = useState<string>("");
  const [cInstagram, setCInstagram] = useState<string>("");
  const [cLinkedin, setCLinkedin] = useState<string>("");
  const [cTwitter, setCTwitter] = useState<string>("");
  const [cYoutube, setCYoutube] = useState<string>("");
  const [cGithub, setCGithub] = useState<string>("");

  useEffect(() => {
    if (cmsContent && cmsContent.contactSettings) {
      setCWhatsapp(cmsContent.contactSettings.whatsapp || "");
      setCEmail(cmsContent.contactSettings.email || "");
      setCPhone(cmsContent.contactSettings.phone || "");
      setCSupportEmail(cmsContent.contactSettings.supportEmail || "");
      setCBusinessHours(cmsContent.contactSettings.businessHours || "");
      setCFacebook(cmsContent.contactSettings.facebook || "");
      setCInstagram(cmsContent.contactSettings.instagram || "");
      setCLinkedin(cmsContent.contactSettings.linkedin || "");
      setCTwitter(cmsContent.contactSettings.twitter || "");
      setCYoutube(cmsContent.contactSettings.youtube || "");
      setCGithub(cmsContent.contactSettings.github || "");
    }
  }, [cmsContent]);

  // SECTION REORDER FUNCTIONS
  const moveSectionUp = (idx: number) => {
    if (idx === 0) return;
    const items = [...sectionsOrder];
    const prev = items[idx - 1];
    items[idx - 1] = items[idx];
    items[idx] = prev;
    setSectionsOrder(items);
  };

  const moveSectionDown = (idx: number) => {
    if (idx === sectionsOrder.length - 1) return;
    const items = [...sectionsOrder];
    const next = items[idx + 1];
    items[idx + 1] = items[idx];
    items[idx] = next;
    setSectionsOrder(items);
  };

  const toggleSectionVis = (key: string) => {
    const updatedVis = {
      ...sectionVisibility,
      [key]: sectionVisibility[key] === false ? true : false
    };
    setSectionVisibility(updatedVis);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const items = [...sectionsOrder];
    const item = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, item);
    setSectionsOrder(items);
    setDraggedIndex(null);
  };

  // SAVE ACTIONS
  const saveHeroAndLayout = async () => {
    try {
      await updateCmsContent({
        heroTitle,
        heroSubtitle,
        heroBadge,
        heroBadgeEffect,
        heroCtaPrimaryText,
        heroCtaSecondaryText,
        homepageSections: sectionsOrder,
        sectionVisibility
      });
      if (currentUser) {
        addActivityLog(currentUser.id, "Executed structural website CMS layout sequence and hero update", "Hero & Homepage order customized", `Visible: ${sectionsOrder.filter(k => sectionVisibility[k] !== false).join(", ")}`);
      }
      showToast("Hero content & sections layout applied successfully!");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to update Hero section");
    }
  };

  const resetHeroDefaults = () => {
    setHeroTitle("Crafting Divine Aesthetic Digital High-Utility Systems");
    setHeroSubtitle("Diavox Tech helps modern brands establish a strong online presence and automate operational bottlenecks. We craft high-speed websites, bespoke SEO campaigns, AI automations, and downloadable digital assets that turn traffic into long-term growth.");
    setHeroBadge("Serving clients worldwide remotely");
    setHeroBadgeEffect("spin");
    setSectionsOrder(["hero", "services", "portfolio", "team", "reviews", "pricing", "blog", "contact"]);
    setSectionVisibility({
      hero: true,
      services: true,
      portfolio: true,
      team: true,
      reviews: true,
      pricing: true,
      blog: true,
      contact: true
    });
  };

  const saveBrandingAndColors = async () => {
    try {
      await updateCmsContent({
        sectionTitles: sectTitles,
        sectionSubtitles: sectSubtitles,
        sectionDescriptions: sectDescriptions,
        sectionColors: sectColors,
        fontSans,
        defaultCurrency,
        fontDisplay,
        fontMono,
        headerLogoTitle,
        headerLogoAccent,
        headerLogoSubtitle,
        footerLogoText,
        footerLogoAccent,
        footerBrandDesc,
        footerCopyright,
        footerCredit,
        footerNotation1,
        footerNotation2
      });
      if (currentUser) {
        addActivityLog(currentUser.id, "Updated section titles, typography fonts, header branding & footer information", "Branding Customization", "Custom branding parameters and fonts successfully saved.");
      }
      showToast("Branding, fonts, header & footer updated! Refreshing live overrides.");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to save Branding options");
    }
  };

  // SERVICES HANDLERS
  const addService = () => {
    if (!newSvcTitle.trim()) return;
    if (editingSvcId) {
      const updated = services.map(s => {
        if (s.id === editingSvcId) {
          return { ...s, title: newSvcTitle, description: newSvcDesc, icon: newSvcIcon };
        }
        return s;
      });
      setServices(updated);
      setEditingSvcId(null);
    } else {
      const newSvc = {
        id: "service-" + Math.random().toString(36).substring(4),
        title: newSvcTitle,
        description: newSvcDesc,
        icon: newSvcIcon
      };
      const updated = [...services, newSvc];
      setServices(updated);
    }
    setNewSvcTitle("");
    setNewSvcDesc("");
    setNewSvcIcon("Laptop");
  };

  const deleteService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
  };

  const saveServices = async () => {
    try {
      await updateCmsContent({ services });
      if (currentUser) {
        addActivityLog(currentUser.id, "Configured custom services list for website portfolio", "Services list update", `${services.length} items active`);
      }
      showToast("Core website capabilities saved!");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to save capabilities");
    }
  };

  // FAQS HANDLERS
  const addFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    const newFaq = {
      id: "faq-" + Math.random().toString(36).substring(4),
      question: newFaqQ,
      answer: newFaqA
    };
    const updated = [...faqs, newFaq];
    setFaqs(updated);
    setNewFaqQ("");
    setNewFaqA("");
  };

  const deleteFaq = (id: string) => {
    const updated = faqs.filter(f => f.id !== id);
    setFaqs(updated);
    if (editingFaqId === id) {
      setEditingFaqId(null);
      setEditingFaqQ("");
      setEditingFaqA("");
    }
  };

  const startEditFaq = (faq: { id: string; question: string; answer: string }) => {
    setEditingFaqId(faq.id);
    setEditingFaqQ(faq.question);
    setEditingFaqA(faq.answer);
  };

  const updateFaqItem = () => {
    if (!editingFaqQ.trim() || !editingFaqA.trim() || !editingFaqId) return;
    const updated = faqs.map(f => {
      if (f.id === editingFaqId) {
        return { ...f, question: editingFaqQ, answer: editingFaqA };
      }
      return f;
    });
    setFaqs(updated);
    setEditingFaqId(null);
    setEditingFaqQ("");
    setEditingFaqA("");
  };

  const cancelEditFaq = () => {
    setEditingFaqId(null);
    setEditingFaqQ("");
    setEditingFaqA("");
  };

  const saveFaqs = async () => {
    try {
      await updateCmsContent({ faqs });
      if (currentUser) {
        addActivityLog(currentUser.id, "Configured custom FAQ items for main services accordion", "FAQs updated", `${faqs.length} FAQs active`);
      }
      showToast("Interactive FAQs updated!");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to save FAQs");
    }
  };

  // CUSTOM WEBSECTIONS HANDLERS
  const saveCustomSections = async (updatedList: any[]) => {
    let updatedOrder = [...sectionsOrder];
    updatedList.forEach(cs => {
      if (!updatedOrder.includes(cs.id)) {
        updatedOrder.push(cs.id);
      }
    });
    updatedOrder = updatedOrder.filter(orgId => {
      if (orgId.startsWith("custom-")) {
        return updatedList.some(cs => cs.id === orgId);
      }
      return true;
    });

    setSectionsOrder(updatedOrder);
    setCustomSections(updatedList);

    try {
      await updateCmsContent({
        customSections: updatedList,
        homepageSections: updatedOrder
      });

      if (currentUser) {
        addActivityLog(currentUser.id, "Saved bespoke custom sections list & updated page sequence stack", "Custom Sections compiled", `${updatedList.length} custom-built rows compiled`);
      }
      showToast("Interactive Custom Sections updated & homepage stack synchronized!");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to save custom sections");
    }
  };

  const handleCreateOrUpdateSection = async () => {
    if (!csTitle.trim()) {
      showToast("Custom Section requires a valid Title!");
      return;
    }

    let nextList = [...customSections];
    if (editingCsId) {
      nextList = nextList.map(item => item.id === editingCsId ? {
        id: editingCsId,
        title: csTitle,
        subtitle: csSubtitle,
        description: csDescription,
        content: csContent,
        position: csPosition,
        backgroundColor: csBgColor,
        textColor: csTextColor,
        visible: csVisible,
        displayOrder: item.displayOrder || 1
      } : item);
      setEditingCsId(null);
    } else {
      const newId = "custom-" + Math.random().toString(36).substring(4);
      const newSection = {
        id: newId,
        title: csTitle,
        subtitle: csSubtitle,
        description: csDescription,
        content: csContent,
        position: csPosition,
        backgroundColor: csBgColor,
        textColor: csTextColor,
        visible: csVisible,
        displayOrder: customSections.length + 1
      };
      nextList.push(newSection);
    }

    setCsTitle("");
    setCsSubtitle("");
    setCsDescription("");
    setCsContent("");
    setCsPosition("Body");
    setCsBgColor("#0f172a");
    setCsTextColor("#ffffff");
    setCsVisible(true);

    await saveCustomSections(nextList);
  };

  const handleDeleteSection = async (id: string) => {
    const nextList = customSections.filter(item => item.id !== id);
    await saveCustomSections(nextList);
  };

  const handleEditSectionClick = (item: any) => {
    setEditingCsId(item.id);
    setCsTitle(item.title);
    setCsSubtitle(item.subtitle || "");
    setCsDescription(item.description || "");
    setCsContent(item.content || "");
    setCsPosition(item.position || "Body");
    setCsBgColor(item.backgroundColor || "#0f172a");
    setCsTextColor(item.textColor || "#ffffff");
    setCsVisible(item.visible !== false);
  };

  const handleCancelSectionEdit = () => {
    setEditingCsId(null);
    setCsTitle("");
    setCsSubtitle("");
    setCsDescription("");
    setCsContent("");
    setCsPosition("Body");
    setCsBgColor("#0f172a");
    setCsTextColor("#ffffff");
    setCsVisible(true);
  };

  // CONTACT HANDLERS
  const saveContactSettings = async () => {
    try {
      await updateCmsContent({
        contactSettings: {
          whatsapp: cWhatsapp,
          email: cEmail,
          phone: cPhone,
          supportEmail: cSupportEmail,
          businessHours: cBusinessHours,
          facebook: cFacebook,
          instagram: cInstagram,
          linkedin: cLinkedin,
          twitter: cTwitter,
          youtube: cYoutube,
          github: cGithub
        }
      });
      if (currentUser) {
        addActivityLog(currentUser.id, "Updated corporate contact channels, hotline, business hours & social links", "Contact Settings customized", cEmail);
      }
      showToast("Corporate contact credentials synced successfully!");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to save contact settings");
    }
  };

  const saveSphereConfig = async () => {
    try {
      await updateCmsContent({
        sphereConfig: {
          color: sphereColor,
          size: sphereSize,
          labels: sphereLabels,
          sparkEnabled,
          sparkFrequency: sparkFreq,
          rotationSpeed: sphereRotation,
          rings: sphereRings,
          segments: sphereSegments
        }
      });
      if (currentUser) {
        addActivityLog(currentUser.id, "Updated 3D Interactive Sphere configuration", "Sphere Customization", `${sphereLabels.length} labels active`);
      }
      showToast("3D Orbit Map configuration applied successfully!");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to save 3D Orbit Map configuration");
    }
  };

  const saveHeroSlider = async () => {
    try {
      await updateCmsContent({
        heroSliderConfig: sliderConfig as any,
        heroSlides: heroSlides
      });
      if (currentUser) {
        addActivityLog(currentUser.id, "Updated Hero Slider configuration & slides", "Hero Customization", `${heroSlides.length} slides configured`);
      }
      showToast("Hero Slider settings published successfully!");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to save Hero Slider settings");
    }
  };

  const sectionMetadata: Record<string, { title: string; desc: string }> = {
    hero: { title: "Hero Presentation Banner", desc: "Top header badge, grand typographic display heading, and call-to-action triggers." },
    services: { title: "Capabilities & Core Services", desc: "Aesthetic display grid detailing deep tech capabilities, templates, and solutions." },
    portfolio: { title: "Creative Case Studies Portfolio", desc: "Rich interactive grid showing client deliveries, case studies, and live platforms." },
    team: { title: "Specialist Experts Team Directory", desc: "Active list of professional specialist profiles, support departments, and authority tags." },
    reviews: { title: "Social Proof Client Testimonials", desc: "Client appraisal logs, transparent satisfaction ratings, and corporate reviews." },
    pricing: { title: "Flexible Retainer Pricing Packages", desc: "Engagement rates, recurring retainer subscriptions, and live milestone simulators." },
    blog: { title: "Corporate Insights & Blogs", desc: "Active chronicles and technical publication boards written by the creative team." },
    contact: { title: "Get in Touch Engagement Desk", desc: "Secure inquiry blueprints, corporate hotline buttons, and live lead chat." }
  };

  return (
    <div className="space-y-6" id="cms-visual-app-builder">
      {/* SUCCESS ALERTS */}
      {successAlert && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 border border-emerald-500 text-emerald-200 px-6 py-3.5 rounded-2xl shadow-xl flex items-center space-x-2.5 font-sans text-xs animate-bounce" id="cms-toast-alert">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span>{successAlert}</span>
        </div>
      )}

      {/* ERROR ALERTS */}
      {errorAlert && (
        <div className="fixed top-5 right-5 z-50 bg-rose-900 border border-rose-500 text-rose-200 px-6 py-3.5 rounded-2xl shadow-xl flex items-center space-x-2.5 font-sans text-xs animate-bounce" id="cms-error-toast-alert">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>{errorAlert}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="border-b dark:border-slate-900 border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h3 className="text-xl font-display font-extrabold flex items-center space-x-2.5">
            <Layout className="text-cyan-500" size={24} />
            <span>Bespoke No-Code CMS Site Builder</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
            Unlock high-utility visual controls. Real-time sequence ordering, custom component branding copy, editable customer FAQs, interactive capabilities, and general phone/hotline parameters.
          </p>
        </div>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 border transition-all shrink-0 cursor-pointer ${
            previewMode 
              ? "bg-purple-950/60 text-purple-400 border-purple-505/30 shadow" 
              : "bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300"
          }`}
        >
          <Laptop size={13} />
          <span>{previewMode ? "Exit Live Preview" : "Live Page Preview"}</span>
        </button>
      </div>

      {!previewMode ? (
        <>
          {/* SUB-TABS SELECTOR */}
          <div className="flex border-b dark:border-slate-900 border-slate-100 p-1 bg-slate-950/45 rounded-xl gap-1 shrink-0 overflow-x-auto whitespace-nowrap scrollbar-none" id="cms-internal-tabs">
        <button
          onClick={() => setSubTab("hero_layout")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
            subTab === "hero_layout" 
              ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 shadow" 
              : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Layout size={13} />
          <span>Hero Settings</span>
        </button>

        <button
          onClick={() => setSubTab("branding")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
            subTab === "branding" 
              ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 shadow" 
              : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Palette size={13} />
          <span>Branding</span>
        </button>

        <button
          onClick={() => setSubTab("services")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
            subTab === "services" 
              ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 shadow" 
              : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Layers size={13} />
          <span>Features</span>
        </button>

        <button
          onClick={() => setSubTab("faqs")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
            subTab === "faqs" 
              ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 shadow" 
              : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <HelpCircle size={13} />
          <span>FAQs</span>
        </button>

        <button
          onClick={() => setSubTab("contact")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
            subTab === "contact" 
              ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 shadow" 
              : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Phone size={13} />
          <span>Contact Info</span>
        </button>

        <button
          onClick={() => setSubTab("custom_sections")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
            subTab === "custom_sections" 
              ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 shadow" 
              : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Layers size={13} />
          <span>Custom Sections</span>
        </button>

        <button
          onClick={() => setSubTab("interactive_3d")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
            subTab === "interactive_3d" 
              ? "bg-purple-950/60 text-purple-400 border border-purple-500/20 shadow" 
              : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Bot size={13} />
          <span>3D Map Settings</span>
        </button>

        <button
          onClick={() => setSubTab("hero_slider")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
            subTab === "hero_slider" 
              ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 shadow" 
              : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Zap size={13} />
          <span>Hero Banner</span>
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}
      <div className="font-sans text-xs">
        
        {/* SUBTAB 1: HERO & SEC SEQUENCE */}
        {subTab === "hero_layout" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start text-left animate-fadeIn">
            {/* Left: General Hero fields */}
            <div className="bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-850 pb-2 text-slate-200 flex items-center space-x-2">
                <Type size={14} className="text-cyan-400" />
                <span>Primary Hero Segment Settings</span>
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Badge Lead Accent Text</label>
                    <input
                      type="text"
                      value={heroBadge}
                      onChange={e => setHeroBadge(e.target.value)}
                      placeholder="e.g. Worldwide remote team"
                      className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Badge Visual Animation Effect</label>
                    <select
                      value={heroBadgeEffect}
                      onChange={e => setHeroBadgeEffect(e.target.value as any)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                    >
                      <option value="spin">Spinning Earth Globe</option>
                      <option value="pulse">Pulsing Globe Silhouette</option>
                      <option value="ping">Active Ping Oracle Dot</option>
                      <option value="none">Standard Static Globe Icon</option>
                      <option value="hide">Hide Badge Entirely</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Hero Headline Title</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={e => setHeroTitle(e.target.value)}
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Hero Body Subtitle Copy</label>
                  <textarea
                    value={heroSubtitle}
                    onChange={e => setHeroSubtitle(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-cyan-500/40 leading-relaxed text-xs font-light"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Primary Button Text</label>
                    <input
                      type="text"
                      value={heroCtaPrimaryText}
                      onChange={e => setHeroCtaPrimaryText(e.target.value)}
                      placeholder="e.g. Request Custom Quote"
                      className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Secondary Button Text</label>
                    <input
                      type="text"
                      value={heroCtaSecondaryText}
                      onChange={e => setHeroCtaSecondaryText(e.target.value)}
                      placeholder="e.g. Explore Work"
                      className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetHeroDefaults}
                  className="px-4 py-2.5 border dark:border-slate-850 hover:bg-slate-850 text-slate-300 rounded-lg text-xs font-mono cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={saveHeroAndLayout}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-white font-mono font-bold hover:brightness-110 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save size={13} />
                  <span>Apply website edits</span>
                </button>
              </div>
            </div>

            {/* Right: Drag and drop sequences */}
            <div className="bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 space-y-4">
              <div className="border-b dark:border-slate-850 pb-2">
                <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-200 flex items-center space-x-1.5">
                  <Layout size={13} className="text-cyan-400" />
                  <span>Homepage Module Stack Structure</span>
                </h4>
                <p className="text-[10px] opacity-60 mt-1">
                  Drag sections to reorder or click the arrow controls. Toggle the visibility eye indicator to show/hide segments globally.
                </p>
              </div>

              {/* Stack indicator */}
              <div className="bg-slate-950/40 p-4 rounded-xl border dark:border-slate-850 space-y-1">
                <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase font-bold">Dynamic active path stack</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sectionsOrder.map((sec, idx) => {
                    const isVisible = sectionVisibility[sec] !== false;
                    return (
                      <React.Fragment key={sec}>
                        <div className={`p-1.5 rounded text-[10px] font-mono flex items-center space-x-1 ${
                          isVisible ? "bg-slate-900 border dark:border-slate-800 text-cyan-400" : "bg-slate-950/10 line-through text-slate-600 border-slate-900"
                        }`}>
                          <span>{sec}</span>
                        </div>
                        {idx < sectionsOrder.length - 1 && <span className="text-slate-600 self-center">→</span>}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Interactive block list */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {sectionsOrder.map((secKey, idx) => {
                  const meta = sectionMetadata[secKey] || { title: secKey.toUpperCase(), desc: "Custom webpage block" };
                  const isVisible = sectionVisibility[secKey] !== false;

                  return (
                    <div
                      key={secKey}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all select-none ${
                        draggedIndex === idx
                          ? "bg-cyan-500/10 border-cyan-500 scale-[0.98] opacity-60"
                          : theme === "dark"
                          ? "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/10"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      } cursor-grab active:cursor-grabbing`}
                    >
                      <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                        <div className="text-slate-500 hover:text-slate-300 p-0.5 pointer-events-none">
                          <GripVertical size={14} className="opacity-65" />
                        </div>
                        <div className="text-left truncate">
                          <p className={`text-xs font-bold leading-tight ${
                            isVisible ? "text-slate-100 dark:text-white" : "text-slate-500 line-through opacity-70"
                          }`}>
                            {meta.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-light mt-0.5 truncate max-w-[200px] sm:max-w-[280px]">
                            {meta.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveSectionUp(idx)}
                          disabled={idx === 0}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronUp size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSectionDown(idx)}
                          disabled={idx === sectionsOrder.length - 1}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronDown size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSectionVis(secKey)}
                          className={`p-1 rounded border transition-colors ${
                            isVisible
                              ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/20"
                              : "bg-rose-500/5 border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                          }`}
                        >
                          {isVisible ? <Eye size={11} /> : <EyeOff size={11} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={saveHeroAndLayout}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg text-white font-mono font-bold hover:brightness-110 flex items-center space-x-1.5 cursor-pointer leading-none"
                >
                  <Save size={13} />
                  <span>Save sequence stack</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: BRANDING HEADINGS & DESIGN COLORS */}
        {subTab === "branding" && (
          <div className="bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 text-left animate-fadeIn">
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-850 pb-2 text-slate-200 flex items-center space-x-2">
              <Palette size={14} className="text-cyan-400" />
              <span>Configure Global Heading Text & Layout Styling</span>
            </h4>
            <p className="text-[10px] opacity-60 mt-1 mb-4 leading-relaxed">
              Tailor titles, micro-subtitles, descriptions, and color styling classes for each page section dynamically. These propagate directly into client public views.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(sectionMetadata).filter(k => k !== "hero").map(sect => {
                const sectMeta = sectionMetadata[sect];
                return (
                  <div key={sect} className="bg-slate-950/40 p-4 rounded-xl border dark:border-slate-850 space-y-3">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold block border-b border-cyan-500/10 pb-1 uppercase">{sectMeta.title}</span>

                    <div>
                      <label className="text-[9px] font-mono opacity-50 block mb-0.5">Section Display Title</label>
                      <input
                        type="text"
                        value={sectTitles[sect] || ""}
                        onChange={e => setSectTitles({ ...sectTitles, [sect]: e.target.value })}
                        className="w-full bg-slate-950 border dark:border-slate-800 p-2 rounded-lg text-white focus:outline-none focus:border-cyan-500/40 text-xs font-semibold"
                        placeholder="e.g. VALUE RETENTION RETREAT"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono opacity-50 block mb-0.5">Sub-title Tagline</label>
                      <input
                        type="text"
                        value={sectSubtitles[sect] || ""}
                        onChange={e => setSectSubtitles({ ...sectSubtitles, [sect]: e.target.value })}
                        className="w-full bg-slate-950 border dark:border-slate-800 p-2 rounded-lg text-white focus:outline-none focus:border-cyan-500/40 text-xs"
                        placeholder="e.g. Choose a dynamic pricing mode"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono opacity-50 block mb-0.5">Section Description Paragraph</label>
                      <textarea
                        value={sectDescriptions[sect] || ""}
                        onChange={e => setSectDescriptions({ ...sectDescriptions, [sect]: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-950 border dark:border-slate-800 p-2 rounded-lg text-white focus:outline-none focus:border-cyan-500/40 text-[11px]"
                        placeholder="Short paragraph highlighting core features..."
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono opacity-50 block mb-0.5">Section CSS Background / Color Accents</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={sectColors[sect]?.bg || ""}
                          onChange={e => setSectColors({
                            ...sectColors,
                            [sect]: { ...(sectColors[sect] || { text: "white" }), bg: e.target.value }
                          })}
                          className="bg-slate-950 border dark:border-slate-800 p-2 rounded-lg text-white font-mono text-[10px]"
                          placeholder="bg-slate-950"
                        />
                        <input
                          type="text"
                          value={sectColors[sect]?.text || ""}
                          onChange={e => setSectColors({
                            ...sectColors,
                            [sect]: { ...(sectColors[sect] || { bg: "slate-950" }), text: e.target.value }
                          })}
                          className="bg-slate-950 border dark:border-slate-800 p-2 rounded-lg text-white font-mono text-[10px]"
                          placeholder="text-white"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Typography Fonts & Global Branding Extensions */}
            <div className="mt-8 border-t dark:border-slate-800 border-slate-200 pt-8 space-y-6">
              
              {/* Typography configuration block */}
              <div className="bg-slate-950/40 p-6 rounded-2xl border dark:border-slate-850 space-y-4">
                <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 flex items-center space-x-2">
                  <Type size={14} />
                  <span>Configure Theme Typography Fonts (Google Fonts API)</span>
                </h4>
                <p className="text-[10px] opacity-60 leading-relaxed max-w-2xl">
                  Select clean web fonts to stylize the app's interfaces. Font definitions automatically fetch from the official Google Fonts Web API.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Default Site Currency</label>
                    <select
                      value={defaultCurrency}
                      onChange={e => setDefaultCurrency(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white font-semibold text-xs focus:outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                      <option value="SGD">SGD (S$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Heading/Display Font</label>
                    <select
                      value={fontDisplay}
                      onChange={e => setFontDisplay(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white font-semibold text-xs focus:outline-none"
                    >
                      <option value="Space Grotesk">Space Grotesk (Tech Modern)</option>
                      <option value="Outfit">Outfit (Clean Sans)</option>
                      <option value="Playfair Display">Playfair Display (Serif Elegance)</option>
                      <option value="Montserrat">Montserrat (Classic Bold)</option>
                      <option value="Inter">Inter (Swiss Neutral)</option>
                      <option value="Syne">Syne (Creative Display)</option>
                      <option value="Cinzel">Cinzel (Cinematic Serif)</option>
                      <option value="Cormorant Garamond">Cormorant Garamond (Editorial)</option>
                      <option value="Lexend">Lexend (Highly Readable)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Body Copy Font (Sans)</label>
                    <select
                      value={fontSans}
                      onChange={e => setFontSans(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white font-semibold text-xs focus:outline-none"
                    >
                      <option value="Inter">Inter (Standard Neutral)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Highly Modern)</option>
                      <option value="Sora">Sora (Tech-Friendly Sans)</option>
                      <option value="Roboto">Roboto (Clean Android Sans)</option>
                      <option value="Merriweather">Merriweather (Readability Serif)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider font-semibold">Data & Code Font (Mono)</label>
                    <select
                      value={fontMono}
                      onChange={e => setFontMono(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white font-semibold text-xs focus:outline-none"
                    >
                      <option value="JetBrains Mono">JetBrains Mono (Modern Coding)</option>
                      <option value="Fira Code">Fira Code (Developer Ligatures)</option>
                      <option value="Inconsolata">Inconsolata (Sleek Mono)</option>
                      <option value="Courier Prime">Courier Prime (Retro Slate)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Global Header Branding Block */}
              <div className="bg-slate-950/40 p-6 rounded-2xl border dark:border-slate-850 space-y-4">
                <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 flex items-center space-x-2">
                  <Layout size={14} />
                  <span>Configure Header Logo & Tagline Branding</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Logo Brand Name</label>
                    <input
                      type="text"
                      value={headerLogoTitle}
                      onChange={e => setHeaderLogoTitle(e.target.value)}
                      placeholder="e.g. Diavox"
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Logo Accent Text</label>
                    <input
                      type="text"
                      value={headerLogoAccent}
                      onChange={e => setHeaderLogoAccent(e.target.value)}
                      placeholder="e.g. Tech"
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Header Slogan Tagline</label>
                    <input
                      type="text"
                      value={headerLogoSubtitle}
                      onChange={e => setHeaderLogoSubtitle(e.target.value)}
                      placeholder="e.g. GLOBAL REMOTE"
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Global Footer Customisations */}
              <div className="bg-slate-950/40 p-6 rounded-2xl border dark:border-slate-850 space-y-4">
                <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 flex items-center space-x-2">
                  <Heart size={14} />
                  <span>Configure Global Footer Branding & Legals</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Footer Brand Title</label>
                    <input
                      type="text"
                      value={footerLogoText}
                      onChange={e => setFooterLogoText(e.target.value)}
                      placeholder="e.g. Diavox"
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Footer Brand Accent</label>
                    <input
                      type="text"
                      value={footerLogoAccent}
                      onChange={e => setFooterLogoAccent(e.target.value)}
                      placeholder="e.g. Tech"
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Footer Corporate Description</label>
                  <textarea
                    value={footerBrandDesc}
                    onChange={e => setFooterBrandDesc(e.target.value)}
                    rows={3}
                    placeholder="Brief description of the agency displayed under the logo..."
                    className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white text-xs leading-relaxed focus:outline-none font-light"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Footer Perk / Notation 1</label>
                    <input
                      type="text"
                      value={footerNotation1}
                      onChange={e => setFooterNotation1(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Footer Perk / Notation 2</label>
                    <input
                      type="text"
                      value={footerNotation2}
                      onChange={e => setFooterNotation2(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Copyright Statement Text</label>
                    <input
                      type="text"
                      value={footerCopyright}
                      onChange={e => setFooterCopyright(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Creative Studio Credit Slogan</label>
                    <input
                      type="text"
                      value={footerCredit}
                      onChange={e => setFooterCredit(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="button"
                onClick={saveBrandingAndColors}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-white font-mono font-bold hover:brightness-110 flex items-center space-x-2 cursor-pointer"
              >
                <Save size={13} />
                <span>Save Headings & Branding</span>
              </button>
            </div>
          </div>
        )}

        {/* SUBTAB 4: SERVICE / CAPABILITIES */}
        {subTab === "services" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left animate-fadeIn">
            {/* Left: Services form */}
            <div className="xl:col-span-4 bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 h-fit space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-850 pb-2 text-slate-200">
                {editingSvcId ? "Modify Custom Web Capability" : "Create Custom Web Capability"}
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1">CAPABILITY TITLE</label>
                  <input
                    type="text"
                    value={newSvcTitle}
                    onChange={e => setNewSvcTitle(e.target.value)}
                    placeholder="e.g. Mobile Application Delivery"
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1">ICON VECTOR PRESET</label>
                  <select
                    value={newSvcIcon}
                    onChange={e => setNewSvcIcon(e.target.value)}
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40"
                  >
                    <option value="Laptop">Laptop Icon</option>
                    <option value="Layers">Layers Preset</option>
                    <option value="Settings">Developer Settings⚙️</option>
                    <option value="Bot">Smart AI Agent🤖</option>
                    <option value="Download">Cloud Assets📥</option>
                    <option value="HelpCircle">Help Support❓</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1">DESCRIPTION ESSAY</label>
                  <textarea
                    value={newSvcDesc}
                    onChange={e => setNewSvcDesc(e.target.value)}
                    rows={4}
                    placeholder="Detail the operational values and delivery blueprints clearly..."
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-cyan-500/40 text-xs"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={addService}
                    className="w-full py-3 bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-mono font-bold rounded-xl hover:bg-cyan-900/60 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {editingSvcId ? <Check size={14} /> : <Plus size={14} />}
                    <span>{editingSvcId ? "Update Capability" : "Draft Capability"}</span>
                  </button>

                  {editingSvcId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSvcId(null);
                        setNewSvcTitle("");
                        setNewSvcDesc("");
                        setNewSvcIcon("Laptop");
                      }}
                      className="w-full py-2 bg-slate-950/40 text-slate-400 border dark:border-slate-850 font-mono rounded-xl hover:bg-slate-900 transition-colors cursor-pointer text-[10px]"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Existing capabilities list */}
            <div className="xl:col-span-8 bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 space-y-4">
              <div className="border-b dark:border-slate-850 pb-2 flex justify-between items-center bg-transparent">
                <div>
                  <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-200">
                    Active Capabilities List
                  </h4>
                  <p className="text-[10px] opacity-65 mt-0.5">Custom services loaded inside core showcase pages.</p>
                </div>
                <button
                  type="button"
                  onClick={saveServices}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-lg text-white font-mono font-bold hover:brightness-110 flex items-center space-x-1.5 cursor-pointer text-xs"
                >
                  <Save size={12} />
                  <span>Apply services</span>
                </button>
              </div>

              {services.length === 0 ? (
                <div className="p-8 border border-dashed dark:border-slate-850 rounded-xl text-center text-slate-500 font-mono">
                  No custom service overrides current system presets.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-950/65 border dark:border-slate-850 rounded-xl relative group flex flex-col justify-between">
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center space-x-2 pb-1 border-b dark:border-slate-900">
                          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold bg-cyan-950/40 p-1 rounded">
                            {item.icon}
                          </span>
                          <h5 className="font-bold text-slate-200 truncate">{item.title}</h5>
                        </div>
                        <p className="text-[11px] opacity-75 leading-relaxed font-light line-clamp-3">{item.description}</p>
                      </div>

                      <div className="mt-3 flex justify-end pt-2 border-t dark:border-slate-900 space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSvcId(item.id);
                            setNewSvcTitle(item.title);
                            setNewSvcDesc(item.description);
                            setNewSvcIcon(item.icon);
                          }}
                          className="p-1.5 hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 rounded-lg transition-colors cursor-pointer"
                          title="Edit capability"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingSvcId === item.id) {
                              setEditingSvcId(null);
                              setNewSvcTitle("");
                              setNewSvcDesc("");
                              setNewSvcIcon("Laptop");
                            }
                            deleteService(item.id);
                          }}
                          className="p-1.5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
                          title="Remove capability"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 4: FAQ ACCORDION MANAGER */}
        {subTab === "faqs" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left animate-fadeIn">
            {/* Left: FAQS creation */}
            <div className="xl:col-span-4 bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 h-fit space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-850 pb-2 text-slate-200">
                Draft Service Accordion FAQ
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1">INTERROGATIVE QUESTION</label>
                  <input
                    type="text"
                    value={newFaqQ}
                    onChange={e => setNewFaqQ(e.target.value)}
                    placeholder="e.g. Do you support continuous maintenance?"
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-cyan-500/40 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1">DELIVERY ANSWER</label>
                  <textarea
                    value={newFaqA}
                    onChange={e => setNewFaqA(e.target.value)}
                    rows={5}
                    placeholder="Write a warm, concise, and helpful response..."
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-cyan-500/40 text-xs leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={addFaq}
                  className="w-full py-3 bg-purple-950 text-purple-400 border border-purple-500/30 font-mono font-bold rounded-xl hover:bg-purple-900/60 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add to FAQ Drafts</span>
                </button>
              </div>
            </div>

            {/* Right: FAQs listing */}
            <div className="xl:col-span-8 bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 space-y-4">
              <div className="border-b dark:border-slate-850 pb-2 flex justify-between items-center bg-transparent">
                <div>
                  <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-200">
                    Active Accordion FAQS
                  </h4>
                  <p className="text-[10px] opacity-65 mt-0.5">Interactive dropdowns listed inside website capability pages.</p>
                </div>
                <button
                  type="button"
                  onClick={saveFaqs}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg text-white font-mono font-bold hover:brightness-110 flex items-center space-x-1.5 cursor-pointer text-xs"
                >
                  <Save size={12} />
                  <span>Save active FAQs</span>
                </button>
              </div>

              {faqs.length === 0 ? (
                <div className="p-8 border border-dashed dark:border-slate-850 rounded-xl text-center text-slate-500 font-mono">
                  There are no custom FAQs defined. Default values will be compiled instead.
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {faqs.map((faq, index) => {
                    const isEditing = editingFaqId === faq.id;
                    return (
                      <div key={faq.id} className="p-4 bg-slate-950/60 border dark:border-slate-850 rounded-xl relative text-left">
                        {isEditing ? (
                          <div className="space-y-3">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                              Editing FAQ Accordion {index + 1}
                            </span>
                            <div>
                              <label className="text-[9px] font-mono opacity-50 block mb-1">Question</label>
                              <input
                                type="text"
                                value={editingFaqQ}
                                onChange={e => setEditingFaqQ(e.target.value)}
                                className="w-full bg-slate-950 border dark:border-slate-800 p-2 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500/40"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-mono opacity-50 block mb-1">Answer</label>
                              <textarea
                                value={editingFaqA}
                                onChange={e => setEditingFaqA(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-950 border dark:border-slate-800 p-2 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500/40 leading-relaxed"
                              />
                            </div>
                            <div className="flex justify-end space-x-2 pt-1">
                              <button
                                type="button"
                                onClick={cancelEditFaq}
                                className="px-3 py-1.5 border dark:border-slate-855 hover:bg-slate-850 text-slate-300 rounded text-xs font-mono cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={updateFaqItem}
                                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-550 rounded text-white text-xs font-mono font-bold flex items-center space-x-1 cursor-pointer"
                              >
                                <Check size={11} />
                                <span>Apply Edit</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start border-b dark:border-slate-900 pb-2 mb-2">
                              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                                FAQ ACCORDION {index + 1}
                              </span>
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => startEditFaq(faq)}
                                  className="hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 p-1 rounded-lg transition-colors cursor-pointer"
                                  title="Edit FAQ"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteFaq(faq.id)}
                                  className="hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 p-1 rounded-lg transition-colors cursor-pointer"
                                  title="Delete FAQ"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <h5 className="font-bold text-slate-100">{faq.question}</h5>
                            <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">{faq.answer}</p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 5: CONTACT CHANNELS */}
        {subTab === "contact" && (
          <div className="bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 text-left animate-fadeIn">
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-850 pb-2 text-slate-200 flex items-center space-x-2">
              <Phone size={14} className="text-cyan-400" />
              <span>Configure Corporate Contact Credentials</span>
            </h4>
            <p className="text-[10px] opacity-60 mt-1 mb-4 leading-relaxed">
              Define actual Phone indices, WhatsApp routing handles, and corporate business hours display globally.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">WHATSAPP ROUTING PHONE NUMBER</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-500 font-mono text-xs">+</span>
                    <input
                      type="text"
                      value={cWhatsapp}
                      onChange={e => setCWhatsapp(e.target.value)}
                      placeholder="e.g. 911234567890 (no spaces, only integers with country code)"
                      className="w-full bg-slate-950 border dark:border-slate-800 p-3 pl-7 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 block">Specify integers only (e.g. 18005553210). WhatsApp link filters invalid characters.</span>
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">GENERAL INQUIRY CONTACT EMAIL</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-500" size={14} />
                    <input
                      type="email"
                      value={cEmail}
                      onChange={e => setCEmail(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-3 pl-8.5 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                      placeholder="hello@diavox.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">CORPORATE HOT PHONE LINE</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-500" size={14} />
                    <input
                      type="text"
                      value={cPhone}
                      onChange={e => setCPhone(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-3 pl-8.5 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                      placeholder="+1 (800) 555-3210"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">SUPPORT ESCALATIONS DESK EMAIL</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-500" size={14} />
                    <input
                      type="email"
                      value={cSupportEmail}
                      onChange={e => setCSupportEmail(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-3 pl-8.5 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                      placeholder="support@diavox.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">WEEKLY BUSINESS SLA HOURS</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 text-slate-500" size={14} />
                    <input
                      type="text"
                      value={cBusinessHours}
                      onChange={e => setCBusinessHours(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-3 pl-8.5 rounded-xl text-white focus:outline-none focus:border-cyan-500/40 text-xs font-light"
                      placeholder="Mon - Fri: 9:00 AM - 6:00 PM (GMT-5)"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/40 p-4 border dark:border-slate-850 rounded-xl h-[92px] flex items-center space-x-3.5">
                  <AlertCircle className="text-amber-500 shrink-0" size={18} />
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    Note: General contact routing settings affect contact headers, maps, service drawers, and transactional notifications for active users.
                  </p>
                </div>
              </div>
            </div>

            {/* SOCIAL MEDIA CHANNELS SECTION */}
            <div className="mt-6 border-t dark:border-slate-850 pt-6">
              <h5 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300 mb-3">Dynamic Social Media Integration</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Facebook Page Link</label>
                  <input
                    type="url"
                    value={cFacebook}
                    onChange={e => setCFacebook(e.target.value)}
                    placeholder="https://facebook.com/diavoxtech"
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Instagram Handle Link</label>
                  <input
                    type="url"
                    value={cInstagram}
                    onChange={e => setCInstagram(e.target.value)}
                    placeholder="https://instagram.com/diavoxtech"
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">LinkedIn Company Page</label>
                  <input
                    type="url"
                    value={cLinkedin}
                    onChange={e => setCLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/company/diavoxtech"
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">X / Twitter URL</label>
                  <input
                    type="url"
                    value={cTwitter}
                    onChange={e => setCTwitter(e.target.value)}
                    placeholder="https://x.com/diavoxtech"
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">YouTube Channel Link</label>
                  <input
                    type="url"
                    value={cYoutube}
                    onChange={e => setCYoutube(e.target.value)}
                    placeholder="https://youtube.com/@diavoxtech"
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">GitHub Organization URL</label>
                  <input
                    type="url"
                    value={cGithub}
                    onChange={e => setCGithub(e.target.value)}
                    placeholder="https://github.com/diavoxtech"
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t dark:border-slate-850 mt-4 flex justify-end">
              <button
                type="button"
                onClick={saveContactSettings}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-white font-mono font-bold hover:brightness-110 flex items-center space-x-2 cursor-pointer"
              >
                <Save size={13} />
                <span>Save Contact settings</span>
              </button>
            </div>
          </div>
        )}

        {/* SUBTAB 6: VISUAL PAGE BUILDER (CUSTOM SECTIONS) */}
        {subTab === "custom_sections" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start text-left animate-fadeIn">
            {/* Left Column: Form to compose/update custom sections */}
            <div className="bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-850 pb-2 text-slate-200 flex items-center space-x-2">
                <Plus size={14} className="text-cyan-400" />
                <span>{editingCsId ? "Edit Custom Section Banner" : "Create Bespoke Web Section"}</span>
              </h4>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">SECTION MAIN ACCENT/TITLE</label>
                  <input
                    type="text"
                    value={csTitle}
                    onChange={e => setCsTitle(e.target.value)}
                    placeholder="e.g. Executive Support & Consulting"
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">SUBTITLE / BADGE CAPTION</label>
                  <input
                    type="text"
                    value={csSubtitle}
                    onChange={e => setCsSubtitle(e.target.value)}
                    placeholder="e.g. Direct 1-on-1 advisory with Principal architects"
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-cyan-500/40 text-xs font-light"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">SHORT EXPLANATIVE PARAGRAPH</label>
                  <textarea
                    value={csDescription}
                    onChange={e => setCsDescription(e.target.value)}
                    rows={3}
                    placeholder="Provide a general high-level summary of the segment scope..."
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-cyan-500/40 text-xs font-light leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">RICH MARKDOWN/DETAILED PARAGRAPH CONTENT</label>
                  <textarea
                    value={csContent}
                    onChange={e => setCsContent(e.target.value)}
                    rows={5}
                    placeholder="Supply detailed features or bulleted copy..."
                    className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-cyan-500/40 text-xs font-light leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">LAYOUT PLACEMENT POSITION</label>
                    <select
                      value={csPosition}
                      onChange={e => setCsPosition(e.target.value as any)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs h-[42px]"
                    >
                      <option value="Header">Header (Top of page banner)</option>
                      <option value="Body">Body (In-stack component)</option>
                      <option value="Footer">Footer (Above-footer disclaimer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">CURRENT VISIBILITY STATUS</label>
                    <select
                      value={csVisible ? "true" : "false"}
                      onChange={e => setCsVisible(e.target.value === "true")}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs h-[42px]"
                    >
                      <option value="true">Published (Visible)</option>
                      <option value="false">Hidden (Unpublished draft)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Background Color Code</label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={csBgColor}
                        onChange={e => setCsBgColor(e.target.value)}
                        className="w-10 h-[42px] rounded-xl bg-slate-950 border dark:border-slate-800 p-1 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={csBgColor}
                        onChange={e => setCsBgColor(e.target.value)}
                        className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Text Color Code</label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={csTextColor}
                        onChange={e => setCsTextColor(e.target.value)}
                        className="w-10 h-[42px] rounded-xl bg-slate-950 border dark:border-slate-800 p-1 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={csTextColor}
                        onChange={e => setCsTextColor(e.target.value)}
                        className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t dark:border-slate-850 flex justify-end space-x-2">
                {editingCsId && (
                  <button
                    type="button"
                    onClick={handleCancelSectionEdit}
                    className="px-4 py-2 border dark:border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCreateOrUpdateSection}
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg text-white font-mono font-bold flex items-center space-x-1.5 cursor-pointer text-xs"
                >
                  <Check size={13} />
                  <span>{editingCsId ? "Apply custom changes" : "Compile custom section"}</span>
                </button>
              </div>
            </div>

            {/* Right Column: List of compiled custom segments and order metrics */}
            <div className="bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-850 pb-2 text-slate-200 flex items-center space-x-1.5">
                <Layers size={13} className="text-cyan-400" />
                <span>Compiled Custom Segments ({customSections.length})</span>
              </h4>

              {customSections.length === 0 ? (
                <div className="text-center py-10 opacity-40 font-light">
                  No custom sections have been generated yet. Use the composer on the left to add your first high-converting landing banner.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
                  {customSections.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-950 border dark:border-slate-850 border-slate-200 text-left relative overflow-hidden group space-y-2"
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-1.5 opacity-80"
                        style={{ backgroundColor: item.backgroundColor }}
                      />

                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-display font-bold text-slate-200 text-xs sm:text-sm">
                              {item.title}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400 border border-cyan-500/10">
                              {item.position || "Body"}
                            </span>
                          </div>
                          {item.subtitle && (
                            <p className="text-[10px] opacity-60 font-mono mt-0.5">{item.subtitle}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditSectionClick(item)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-850 text-cyan-400 rounded-lg cursor-pointer transition-colors"
                            title="Edit Section Fields"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(item.id)}
                            className="p-1.5 bg-slate-900 hover:bg-red-950 hover:text-red-400 text-red-500 rounded-lg cursor-pointer transition-colors"
                            title="Physically Delete Section"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-[11px] opacity-75 font-sans font-light line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[9px] font-mono opacity-50 pt-1 border-t border-slate-900">
                        <span>Sort Rank: {index + 1}</span>
                        <span className={item.visible !== false ? "text-emerald-400" : "text-amber-500"}>
                          {item.visible !== false ? "● Visible" : "○ Draft/Hidden"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 7: INTERACTIVE 3D ORBIT CONFIG */}
        {subTab === "interactive_3d" && (
          <div className="bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 text-left animate-fadeIn space-y-6">
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-850 pb-2 text-slate-200 flex items-center space-x-2">
              <Bot size={14} className="text-purple-400" />
              <span>3D Interactive Sphere & Sparks Analytics</span>
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Sphere Aesthetic Color (RGBA)</label>
                    <input
                      type="text"
                      value={sphereColor}
                      onChange={e => setSphereColor(e.target.value)}
                      placeholder="rgba(188, 156, 110, 1)"
                      className="w-full bg-slate-950 border dark:border-slate-800 p-3 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Sphere Dimension Scale ({sphereSize})</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.01"
                      value={sphereSize}
                      onChange={e => setSphereSize(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-850">
                    <div>
                      <p className="text-xs font-bold text-white">Enable Spark Animations</p>
                      <p className="text-[10px] text-slate-500 font-mono italic">Professional luxurious connector sparks</p>
                    </div>
                    <button
                      onClick={() => setSparkEnabled(!sparkEnabled)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        sparkEnabled ? "bg-cyan-500" : "bg-slate-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        sparkEnabled ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Spark Frequency Alpha ({sparkFreq})</label>
                    <input
                      type="range"
                      min="0.001"
                      max="0.2"
                      step="0.001"
                      value={sparkFreq}
                      onChange={e => setSparkFreq(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Auto-Rotation Velocity ({sphereRotation})</label>
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.01"
                      value={sphereRotation}
                      onChange={e => setSphereRotation(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Lattice Rings ({sphereRings})</label>
                      <input
                        type="number"
                        min="2"
                        max="12"
                        value={sphereRings}
                        onChange={e => setSphereRings(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white font-mono text-xs outline-none focus:border-cyan-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Lattice Segments ({sphereSegments})</label>
                      <input
                        type="number"
                        min="3"
                        max="24"
                        value={sphereSegments}
                        onChange={e => setSphereSegments(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white font-mono text-xs outline-none focus:border-cyan-500/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={saveSphereConfig}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl text-white font-mono font-bold hover:brightness-110 flex items-center space-x-2 shadow-lg shadow-purple-500/10 cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Compile Sphere Config</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Dynamic Sphere Labels (Internal Content)</label>
                <div className="space-y-2">
                  {sphereLabels.map((label, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={label}
                        onChange={e => {
                          const newList = [...sphereLabels];
                          newList[idx] = e.target.value;
                          setSphereLabels(newList);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500/30"
                      />
                      <button
                        onClick={() => {
                          const newList = sphereLabels.filter((_, i) => i !== idx);
                          setSphereLabels(newList);
                        }}
                        className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setSphereLabels([...sphereLabels, "NEW.METRIC: VALUE"])}
                    className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:bg-slate-900/30 flex items-center justify-center space-x-2 text-[11px] font-mono"
                  >
                    <Plus size={13} />
                    <span>Append New Meta Label</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 8: HERO SLIDER MANAGER */}
        {subTab === "hero_slider" && (
          <div className="space-y-6">
            {/* Global Slider Config */}
            <div className="bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 text-left animate-fadeIn space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-200 flex items-center space-x-2">
                  <Zap size={14} className="text-cyan-400" />
                  <span>Global Slider Orchestration</span>
                </h4>
                <button
                  onClick={saveHeroSlider}
                  className="px-4 py-2 bg-cyan-600 rounded-lg text-white font-mono text-[11px] font-bold hover:brightness-110 flex items-center space-x-2 shadow-lg shadow-cyan-500/10"
                >
                  <Save size={13} />
                  <span>Publish Settings</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Autoplay Loop</label>
                  <div 
                    onClick={() => setSliderConfig({ ...sliderConfig, autoplay: !sliderConfig.autoplay })}
                    className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-center space-x-2 ${
                      sliderConfig.autoplay ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400" : "bg-slate-900/40 border-slate-800 text-slate-500"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${sliderConfig.autoplay ? "bg-cyan-400 animate-pulse" : "bg-slate-700"}`} />
                    <span className="text-xs font-bold uppercase">{sliderConfig.autoplay ? "Active" : "Disabled"}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Transition Delay (Seconds)</label>
                  <select
                    value={sliderConfig.duration}
                    onChange={e => setSliderConfig({ ...sliderConfig, duration: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="2000">2.0s (Fast)</option>
                    <option value="3000">3.0s (Standard)</option>
                    <option value="4000">4.0s (Slow)</option>
                    <option value="5000">5.0s (Stately)</option>
                    <option value="8000">8.0s (Reading focus)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono opacity-50 block mb-1 uppercase tracking-wider">Default Core Effect</label>
                  <select
                    value={sliderConfig.globalEffect}
                    onChange={e => setSliderConfig({ ...sliderConfig, globalEffect: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="fade">Fade (Standard)</option>
                    <option value="slide-left">Slide Left</option>
                    <option value="slide-right">Slide Right</option>
                    <option value="zoom-in">Zoom In</option>
                    <option value="blur-fade">Blur + Fade</option>
                    <option value="typewriter">Typewriter (Premium)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Slides CRUD */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400">Content Slide Library</h4>
                <button
                  onClick={() => {
                    const newSlide = {
                      id: `slide-${Date.now()}`,
                      title: "New Premium Solution",
                      subtitle: "Enter impactful description here.",
                      buttonText: "Learn More",
                      buttonLink: "#services",
                      status: true
                    };
                    setHeroSlides([...heroSlides, newSlide]);
                  }}
                  className="flex items-center space-x-1.5 text-[10px] text-cyan-400 font-mono hover:text-cyan-300 transition-colors uppercase tracking-widest"
                >
                  <Plus size={14} />
                  <span>Append Slide</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {heroSlides.map((slide, idx) => (
                  <div key={slide.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 text-left space-y-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center space-x-2">
                         <span className="text-[10px] font-mono text-slate-500 uppercase">Slide #{idx + 1}</span>
                         {slide.status ? (
                           <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-tighter">Live</span>
                         ) : (
                           <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 text-[9px] font-bold uppercase tracking-tighter">Draft</span>
                         )}
                       </div>
                       <div className="flex items-center space-x-2">
                         <button 
                           onClick={() => {
                             const newList = [...heroSlides];
                             newList[idx].status = !newList[idx].status;
                             setHeroSlides(newList);
                           }}
                           className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                         >
                           {slide.status ? <EyeOff size={13} /> : <Eye size={13} />}
                         </button>
                         <button
                           disabled={idx === 0}
                           onClick={() => {
                             const newList = [...heroSlides];
                             const temp = newList[idx];
                             newList[idx] = newList[idx - 1];
                             newList[idx - 1] = temp;
                             setHeroSlides(newList);
                           }}
                           className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                         >
                           <ChevronUp size={13} />
                         </button>
                         <button
                           disabled={idx === heroSlides.length - 1}
                           onClick={() => {
                             const newList = [...heroSlides];
                             const temp = newList[idx];
                             newList[idx] = newList[idx + 1];
                             newList[idx + 1] = temp;
                             setHeroSlides(newList);
                           }}
                           className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                         >
                           <ChevronDown size={13} />
                         </button>
                         <button
                           onClick={() => setHeroSlides(heroSlides.filter((_, i) => i !== idx))}
                           className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                         >
                           <X size={13} />
                         </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-mono opacity-40 uppercase tracking-widest pl-1 mb-1 block">Hero Heading</label>
                          <input
                            type="text"
                            value={slide.title}
                            onChange={e => {
                              const newList = [...heroSlides];
                              newList[idx].title = e.target.value;
                              setHeroSlides(newList);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-display font-bold text-sm focus:border-cyan-500/30 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono opacity-40 uppercase tracking-widest pl-1 mb-1 block">Hero Subtitle</label>
                          <textarea
                            value={slide.subtitle}
                            onChange={e => {
                              const newList = [...heroSlides];
                              newList[idx].subtitle = e.target.value;
                              setHeroSlides(newList);
                            }}
                            rows={2}
                            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-sans text-xs focus:border-cyan-500/30 outline-none resize-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-mono opacity-40 uppercase tracking-widest pl-1 mb-1 block">Button Label</label>
                            <input
                              type="text"
                              value={slide.buttonText}
                              onChange={e => {
                                const newList = [...heroSlides];
                                newList[idx].buttonText = e.target.value;
                                setHeroSlides(newList);
                              }}
                              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-mono opacity-40 uppercase tracking-widest pl-1 mb-1 block">Button Target</label>
                            <input
                              type="text"
                              value={slide.buttonLink}
                              onChange={e => {
                                const newList = [...heroSlides];
                                newList[idx].buttonLink = e.target.value;
                                setHeroSlides(newList);
                              }}
                              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-cyan-400 font-mono text-[10px] outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-mono opacity-40 uppercase tracking-widest pl-1 mb-1 block">Specific Override Effect</label>
                            <select
                              value={slide.effect || ""}
                              onChange={e => {
                                const newList = [...heroSlides];
                                newList[idx].effect = e.target.value || undefined;
                                setHeroSlides(newList);
                              }}
                              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-[10px] outline-none"
                            >
                              <option value="">(Inherit Global)</option>
                              <option value="fade">Fade</option>
                              <option value="slide-left">Slide Left</option>
                              <option value="slide-right">Slide Right</option>
                              <option value="zoom-in">Zoom In</option>
                              <option value="blur-fade">Blur + Fade</option>
                              <option value="typewriter">Typewriter</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-mono opacity-40 uppercase tracking-widest pl-1 mb-1 block">Background Image (URL)</label>
                            <input
                              type="text"
                              value={slide.backgroundImage || ""}
                              onChange={e => {
                                const newList = [...heroSlides];
                                newList[idx].backgroundImage = e.target.value;
                                setHeroSlides(newList);
                              }}
                              placeholder="https://images.unsplash..."
                              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-[10px] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {heroSlides.length === 0 && (
                <div className="py-12 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-3 opacity-40">
                   <Inbox size={32} />
                   <p className="text-sm font-mono tracking-widest uppercase">No Active Slides Found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

        </>
      ) : (
        /* LIVE PREVIEW PORTAL */
        <div className="space-y-4 animate-fadeIn">
          {/* Viewport indicators */}
          <div className="bg-slate-950 p-3 rounded-t-2xl border-t border-x dark:border-slate-800 border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-slate-500 font-sans tracking-wide pl-2">https://localhost:3000 (Live Sandbox Preview)</span>
            </div>
            <span className="text-[10px] text-cyan-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">Real-time Sandbox Mockup</span>
            </span>
          </div>

          {/* Scrollable mockup body */}
          <div className="h-[680px] overflow-y-auto bg-slate-950 border-b border-x dark:border-slate-800 border-slate-200 rounded-b-2xl p-1 relative scrollbar-thin scrollbar-thumb-slate-800">
            
            {/* HEADER POSITION CUSTOM SECTIONS */}
            {(cmsContent?.customSections || [])
              .filter(cs => cs.position === "Header" && cs.visible !== false)
              .map(cs => (
                <div
                  key={cs.id}
                  style={{ backgroundColor: cs.backgroundColor || undefined, color: cs.textColor || undefined }}
                  className="p-12 border-b border-white/5 text-left"
                >
                  <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">{cs.subtitle || "Custom Header Area"}</span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold mt-1 text-white">{cs.title}</h3>
                  {cs.description && <p className="text-xs sm:text-sm opacity-80 mt-2 font-light">{cs.description}</p>}
                  {cs.content && <p className="text-[11px] sm:text-xs opacity-70 mt-2 font-mono whitespace-pre-wrap">{cs.content}</p>}
                </div>
              ))}

            {/* HOMEPAGE STACK SECTIONS */}
            {sectionsOrder.map((sectionKey) => {
              const rootCms = cmsContent || { sectionVisibility: {} };
              const visible = rootCms.sectionVisibility ? rootCms.sectionVisibility[sectionKey] !== false : true;
              if (!visible) return null;

              switch (sectionKey) {
                case "hero":
                  return (
                    <div key="hero" className="border-b border-slate-900 pointer-events-none opacity-95">
                      <Hero onNavigate={() => {}} onOpenAuth={() => {}} />
                    </div>
                  );
                case "services":
                  return (
                    <div key="services" className="border-b border-slate-900 pointer-events-none opacity-95">
                      <Services onNavigate={() => {}} onOpenAuth={() => {}} />
                    </div>
                  );
                case "portfolio":
                  return (
                    <div key="portfolio" className="border-b border-slate-900 pointer-events-none opacity-95">
                      <Portfolio preview={true} onNavigate={() => {}} />
                    </div>
                  );
                case "team":
                  return (
                    <div key="team" className="border-b border-slate-900 pointer-events-none opacity-95">
                      <Team preview={true} onNavigate={() => {}} />
                    </div>
                  );
                case "pricing":
                  return (
                    <div key="pricing" className="border-b border-slate-900 pointer-events-none opacity-95">
                      <Pricing preview={true} onOpenAuth={() => {}} onNavigate={() => {}} />
                    </div>
                  );
                case "blog":
                  return (
                    <div key="blog" className="border-b border-slate-900 pointer-events-none opacity-95">
                      <Blog />
                    </div>
                  );
                case "reviews":
                  return (
                    <div key="reviews" className="border-b border-slate-900 pointer-events-none opacity-95">
                      <Reviews preview={true} onOpenAuth={() => {}} onNavigate={() => {}} />
                    </div>
                  );
                case "contact":
                  return (
                    <div key="contact" className="border-b border-slate-900 pointer-events-none opacity-95">
                      <Contact onOpenAuth={() => {}} onNavigate={() => {}} />
                    </div>
                  );
                default: {
                  if (sectionKey.startsWith("custom-")) {
                    const cs = (cmsContent?.customSections || []).find(c => c.id === sectionKey);
                    if (cs && cs.visible !== false) {
                      return (
                        <div
                          key={cs.id}
                          style={{ backgroundColor: cs.backgroundColor || undefined, color: cs.textColor || undefined }}
                          className="p-12 border-b border-white/5 text-left"
                        >
                          <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">{cs.subtitle || "Custom Body Block"}</span>
                          <h3 className="text-xl sm:text-2xl font-display font-bold mt-1 text-white">{cs.title}</h3>
                          {cs.description && <p className="text-xs sm:text-sm opacity-80 mt-2 font-light">{cs.description}</p>}
                          {cs.content && <p className="text-[11px] sm:text-xs opacity-70 mt-2 font-mono leading-relaxed whitespace-pre-wrap whitespace-pre-line">{cs.content}</p>}
                        </div>
                      );
                    }
                  }
                  return null;
                }
              }
            })}

            {/* FOOTER POSITION CUSTOM SECTIONS */}
            {(cmsContent?.customSections || [])
              .filter(cs => cs.position === "Footer" && cs.visible !== false)
              .map(cs => (
                <div
                  key={cs.id}
                  style={{ backgroundColor: cs.backgroundColor || undefined, color: cs.textColor || undefined }}
                  className="p-12 border-b border-white/5 text-left font-sans"
                >
                  <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">{cs.subtitle || "Custom Footer Disclaimer"}</span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold mt-1 text-white">{cs.title}</h3>
                  {cs.description && <p className="text-xs sm:text-sm opacity-80 mt-2 font-light">{cs.description}</p>}
                  {cs.content && <p className="text-[11px] sm:text-xs opacity-70 mt-2 font-mono leading-relaxed whitespace-pre-wrap">{cs.content}</p>}
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}
