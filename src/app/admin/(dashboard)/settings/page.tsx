import { getStoreSettings, updateStoreSettings } from "@/services/settings";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Store Settings - Admin Dashboard",
};

export default async function SettingsPage() {
  const settings = await getStoreSettings();

  async function saveSettings(formData: FormData) {
    "use server";
    const data = {
      storeName: formData.get("storeName"),
      storeDescription: formData.get("storeDescription"),
      facebookUrl: formData.get("facebookUrl"),
      twitterUrl: formData.get("twitterUrl"),
      instagramUrl: formData.get("instagramUrl"),
    };
    await updateStoreSettings(data);
    redirect("/admin/settings?success=1");
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.03em' }}>Store Settings</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Manage your storefront's global configuration, header, and footer content.</p>

      <form action={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
        
        {/* Basic Settings */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>Brand Identity</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>Store Name</label>
            <input 
              type="text" 
              name="storeName" 
              defaultValue={settings.storeName} 
              required
              style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }} 
            />
            <span style={{ fontSize: '13px', color: '#64748b' }}>This appears in the header and footer logo area.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>Footer Description</label>
            <textarea 
              name="storeDescription" 
              defaultValue={settings.storeDescription} 
              rows={3}
              required
              style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', resize: 'vertical' }} 
            />
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9', marginTop: '16px' }}>Social Media Links</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>Instagram URL</label>
            <input 
              type="url" 
              name="instagramUrl" 
              defaultValue={settings.instagramUrl || ""} 
              placeholder="https://instagram.com/..."
              style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>X (Twitter) URL</label>
            <input 
              type="url" 
              name="twitterUrl" 
              defaultValue={settings.twitterUrl || ""} 
              placeholder="https://twitter.com/..."
              style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>Facebook URL</label>
            <input 
              type="url" 
              name="facebookUrl" 
              defaultValue={settings.facebookUrl || ""} 
              placeholder="https://facebook.com/..."
              style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }} 
            />
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button type="submit" style={{ background: '#111111', color: 'white', padding: '14px 24px', borderRadius: '8px', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer' }}>
            Save Store Settings
          </button>
        </div>
      </form>
    </div>
  );
}
