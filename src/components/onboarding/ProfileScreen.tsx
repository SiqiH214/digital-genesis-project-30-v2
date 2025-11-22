import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileScreenProps {
  onNext: (profileData: any) => void;
  onBack: () => void;
}

export const ProfileScreen = ({ onNext, onBack }: ProfileScreenProps) => {
  const [formData, setFormData] = useState({
    name: "",
    instagram: "",
    twitter: "",
    email: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ ...formData, photos });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).slice(0, 5 - photos.length);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  return (
    <div className="h-full w-full bg-transparent text-beige overflow-y-auto">
      <div className="min-h-full flex flex-col p-6 pt-16 pb-24">
        <Button
          onClick={onBack}
          variant="ghost"
          className="absolute top-4 left-4 text-beige hover:text-primary"
        >
          ← Back
        </Button>
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-primary text-glow">
              IDENTITY MATRIX
            </h2>
            <p className="text-sm text-muted-foreground">
              Define your second existence
            </p>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-primary text-sm uppercase tracking-wider">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-card border-primary/50 focus:border-primary text-beige"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Social Links */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-primary/30" />
                <span className="text-xs text-primary uppercase tracking-wider">Memory Links</span>
                <div className="h-px flex-1 bg-primary/30" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-xs text-muted-foreground">
                  Instagram (optional)
                </Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="bg-card border-primary/50 focus:border-primary text-beige"
                  placeholder="@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-xs text-muted-foreground">
                  Twitter (optional)
                </Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="bg-card border-primary/50 focus:border-primary text-beige"
                  placeholder="@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  Email (optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-card border-primary/50 focus:border-primary text-beige"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-primary/30" />
                <span className="text-xs text-primary uppercase tracking-wider">Core Memories</span>
                <div className="h-px flex-1 bg-primary/30" />
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Upload 5 photos that define your existence
              </p>

              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded border-2 ${
                      photos[i]
                        ? "border-success bg-success/10"
                        : "border-primary/30 border-dashed"
                    } flex items-center justify-center text-xs transition-all`}
                  >
                    {photos[i] ? (
                      <img
                        src={URL.createObjectURL(photos[i])}
                        alt={`Memory ${i + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <span className="text-primary/50">{i + 1}</span>
                    )}
                  </div>
                ))}
              </div>

              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={photos.length >= 5}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-primary/50 text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.preventDefault();
                    (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                  }}
                  disabled={photos.length >= 5}
                >
                  {photos.length === 5 ? "All Memories Captured" : `Upload Photos (${photos.length}/5)`}
                </Button>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground py-6 border-glow text-lg uppercase tracking-wider"
              disabled={!formData.name || photos.length < 5}
            >
              Process Identity Matrix →
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
