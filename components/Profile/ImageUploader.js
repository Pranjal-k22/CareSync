import { useState } from 'react';
import Image from 'next/image';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function ImageUploader({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState(null);

  const uploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (isSupabaseConfigured) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('profiles')
          .upload(filePath, file);

        if (uploadErr) throw uploadErr;

        const { data: publicUrlData } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        const url = publicUrlData?.publicUrl;
        setDownloadURL(url);
        if (onUploadComplete) onUploadComplete(url);
      } else {
        const previewUrl = URL.createObjectURL(file);
        setDownloadURL(previewUrl);
        if (onUploadComplete) onUploadComplete(previewUrl);
      }
    } catch (err) {
      console.warn('ImageUploader error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-800 flex items-center justify-center shadow-lg">
        <Image
          src={downloadURL || '/Logo.svg'}
          alt="Avatar Preview"
          width={96}
          height={96}
          className="object-cover w-full h-full"
        />
        {uploading && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-xs font-bold text-emerald-400 animate-pulse">
            Uploading...
          </div>
        )}
      </div>

      <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-md">
        <span>📸 Choose Photo</span>
        <input
          type="file"
          className="hidden"
          onChange={uploadFile}
          accept="image/png,image/jpeg,image/webp"
        />
      </label>
    </div>
  );
}
