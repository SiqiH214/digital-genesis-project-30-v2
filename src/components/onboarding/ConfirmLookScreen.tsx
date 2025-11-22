import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Loader2, Edit2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BackButton } from "./BackButton";
import { ConfirmButton } from "./ConfirmButton";
import { ProgressIndicator } from "./ProgressIndicator";

interface ConfirmLookScreenProps {
  faceData: any;
  profileData: any;
  onNext: (imageUrl: string) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  onConfirmLookReady?: (callback: () => void) => void;
}

const styleOptions = [
  {
    id: 1,
    name: "Natural Glow",
    description: "Smooth skin, professional lighting, natural beauty enhanced",
    getFemalePrompt: (data: any) => `Remove all the accessories on head if there are any, change the outfits to a similar vibe outfit, remain the face the same, with smooth skin, great professional lighting, great real skin texture, add a tiny bit mixture with an actor from the west, looking natural, looking a bit more sexy, looking cool, background is aesthetic portrait photoshoot background drop, with artistic 2 tone gradient pastel color. Person: ${data.name}, a ${data.gender} ${data.ethnicity}, age ${data.age}. Distinctive features: ${data.eyeColor} eyes. Hair: ${data.hairColor} ${data.hairStyle}.`,
    getMalePrompt: (data: any) => `Remove all the accessories on head if there are any, change the outfits to a similar vibe outfit, remain the face the same, with smooth skin, great professional lighting, great real skin texture, add a tiny bit mixture with an actor from the west, looking natural, looking cool, background is aesthetic portrait photoshoot background drop, with artistic 2 tone gradient pastel color. Person: ${data.name}, a ${data.gender} ${data.ethnicity}, age ${data.age}. Distinctive features: ${data.eyeColor} eyes. Hair: ${data.hairColor} ${data.hairStyle}.`
  },
  {
    id: 2,
    name: "Retro Editorial",
    description: "80s Vogue aesthetic, film grain, cool urban sophistication",
    getFemalePrompt: (data: any) => `Retro editorial street-style aesthetic with a raw, analog edge — reminiscent of 1980s Vogue or early Interview Magazine portraiture. The image features film-like grain and flash lighting that gives a candid yet composed energy, highlighting sharp contrasts and soft imperfections. The color palette is muted and cool-toned, dominated by greys, blacks, and subtle metallic reflections, creating a sophisticated but rebellious urban tone. The overall look carries a mix of power dressing and minimal glamour — an oversized suit jacket, fitted underlayer, and sleek accessories, styled with subtle defiance. The lighting accentuates textures of fabric and skin, adding to the cinematic realism. A sunglasses is on top on the head. The atmosphere feels both nostalgic and modern, as if shot with a point-and-shoot film camera in natural indoor lighting. It captures the effortless nonchalance of old-school magazine covers — casual yet commanding, refined yet cool, the embodiment of timeless confidence. Hard flash effect. Person: ${data.name}, a ${data.gender} ${data.ethnicity}, age ${data.age}. Distinctive features: ${data.eyeColor} eyes. Hair: ${data.hairColor} ${data.hairStyle}.`,
    getMalePrompt: (data: any) => `Retro editorial street-style aesthetic with a raw, analog edge — reminiscent of 1980s Vogue or early Interview Magazine portraiture. The image features film-like grain and flash lighting that gives a candid yet composed energy, highlighting sharp contrasts and soft imperfections. The color palette is muted and cool-toned, dominated by greys, blacks, and subtle metallic reflections, creating a sophisticated but rebellious urban tone. The aesthetic leans into retro sophistication — structured silhouettes, sharp tailoring, and reflective eyewear that embody vintage charisma and self-assured poise. A sunglasses is on top on the head. The atmosphere feels both nostalgic and modern, as if shot with a point-and-shoot film camera in natural indoor lighting. It captures the effortless nonchalance of old-school magazine covers — casual yet commanding, refined yet cool, the embodiment of timeless confidence. Hard flash effect. Person: ${data.name}, a ${data.gender} ${data.ethnicity}, age ${data.age}. Distinctive features: ${data.eyeColor} eyes. Hair: ${data.hairColor} ${data.hairStyle}.`
  },
  {
    id: 3,
    name: "Soft Intimacy",
    description: "Japanese natural-light style, soft film grain, emotional warmth",
    getFemalePrompt: (data: any) => `Soft film grain portrait with fuji camera, aesthetic with a gentle, emotional intimacy — reminiscent of Japanese natural-light photography. The image captures a close-up composition focused on delicate facial details and texture, evoking quiet vulnerability and warmth. Lighting is soft, diffused, and natural, likely from a window, enhancing the subtle glow of the skin and the rosy undertones of the cheeks. The shallow depth of field blurs the background into creamy tones, directing full attention to the subject's expressive eyes and gentle expression. The subject's look emphasizes natural beauty — minimal makeup, slightly tousled hair with soft strands falling across the face, outfits should be a muted pastel loosely knit cardigan, creating a tender, nostalgic feel. The overall aesthetic feels calm, emotional, and tactile — highlighting softness, sincerity, and an almost film-like warmth. It evokes the style of analog portraiture found in Kinfolk or Milk Magazine, where everyday intimacy becomes quietly cinematic and deeply personal. Highlight in the eyes, add light blush on cheeks, cute and sweet, change the background to blurred indoor scene, white curtain. Person: ${data.name}, a ${data.gender} ${data.ethnicity}, age ${data.age}. Distinctive features: ${data.eyeColor} eyes. Hair: ${data.hairColor} ${data.hairStyle}.`,
    getMalePrompt: (data: any) => `Soft film grain portrait with fuji camera, aesthetic with a gentle, emotional intimacy — reminiscent of Japanese natural-light photography. The image captures a close-up composition focused on delicate facial details and texture, evoking quiet vulnerability and warmth. Lighting is soft, diffused, and natural, likely from a window, enhancing the subtle glow of the skin. The shallow depth of field blurs the background into creamy tones, directing full attention to the subject's expressive eyes and gentle expression. The aesthetic features similarly natural lighting and close framing — clean skin texture, relaxed expression, and soft-focus styling. Hair may be slightly undone to keep the organic, contemplative energy. The overall aesthetic feels calm, emotional, and tactile — highlighting softness, sincerity, and an almost film-like warmth. It evokes the style of analog portraiture found in Kinfolk or Milk Magazine, where everyday intimacy becomes quietly cinematic and deeply personal. Highlight in the eyes, change the background to blurred indoor scene, white curtain. Person: ${data.name}, a ${data.gender} ${data.ethnicity}, age ${data.age}. Distinctive features: ${data.eyeColor} eyes. Hair: ${data.hairColor} ${data.hairStyle}.`
  },
  {
    id: 4,
    name: "Bold Confidence",
    description: "Mirror selfie aesthetic, wet hair, high contrast, empowered vibe",
    getFemalePrompt: (data: any) => `Convert the uploaded image into a profile or back angle of confident mirror-style selfie of the subject arranging their wet hair with bold lighting and modern contrast. Pose naturally while holding the phone in a bathroom or modern interior with ambient shadows and clean lines, or in a gray zen style vacation suite bathroom. Outfit can be a dark color string bikini, hot sportswear, or hot crop outfit that highlights physique, styled with minimal jewelry. Hair is a little bit wet. Lighting should emphasize body definition — strong highlights and warm tones with a subtle film grain. The final look should feel empowered, bold, and glossy — a high-contrast social media photo that captures confidence without overediting. A bit more hot and curvy. Hair is wet, Hugo Comte photography style, high definition photo, strong grainy. Person: ${data.name}, a ${data.gender} ${data.ethnicity}, age ${data.age}. Distinctive features: ${data.eyeColor} eyes. Hair: ${data.hairColor} ${data.hairStyle}.`,
    getMalePrompt: (data: any) => `Convert the uploaded image into a profile or back angle of confident mirror-style selfie of the subject arranging their wet hair with bold lighting and modern contrast. Shirtless or wearing an open casual top or gym attire, in similar lighting and mirror composition. Keep reflections realistic and posture natural. Lighting should emphasize body definition — strong highlights and warm tones with a subtle film grain. The final look should feel empowered, bold, and glossy — a high-contrast social media photo that captures confidence without overediting. Hair is wet, Hugo Comte photography style, high definition photo, strong grainy. Person: ${data.name}, a ${data.gender} ${data.ethnicity}, age ${data.age}. Distinctive features: ${data.eyeColor} eyes. Hair: ${data.hairColor} ${data.hairStyle}.`
  },
  {
    id: 5,
    name: "Vintage Glamour",
    description: "90s editorial, windswept hair, warm golden tones, timeless elegance",
    getFemalePrompt: (data: any) => `A person is captured in an elegant, windswept studio portrait against a solid, textured, deep background. They are wearing a 90s vintage styled clothing. Their body is angled towards the camera, but their head is turned in a three-quarter view as they gaze thoughtfully upwards and away, their expression serene with slightly parted lips. Voluminous 80s vintage styled hair frames their face, catching the light and creating a sense of movement, while vintage style accessories adds a touch of detail. This is a tightly cropped, vertical medium close-up shot focusing on the person's head, neck, and shoulders, with the composition placing them slightly off-center. The camera is positioned at a slightly low angle, looking up at the subject, which adds to the poised and graceful mood. The overall style is photorealistic yet highly stylized, evoking a high-fashion, editorial, and vintage 90s glamour aesthetic with a grainy analog feel. The image has medium-high contrast, with rich, dark areas and soft but defined shadows that beautifully sculpt the subject's features, all under a balanced exposure. A deeply warm and saturated color palette dominates the image, with a consistent and strong golden-amber hue washing over the entire scene, creating a cohesive warm tonality with bold, rich colors. The photography has a distinct texture, giving it a nostalgic quality, film grain, grainy texture, analog, soft, hazy, vintage texture, soft glow, analog texture. The lighting is soft and directional, emanating from a warm light source positioned to the front and side, which illuminates the subject's face and creates a gentle, glowy effect while casting soft shadows, soft lighting, warm light, studio lighting, glowy lighting, directional lighting, soft shadows. Person: ${data.name}, a ${data.gender} ${data.ethnicity}, age ${data.age}. Distinctive features: ${data.eyeColor} eyes. Hair: ${data.hairColor} ${data.hairStyle}.`,
    getMalePrompt: (data: any) => `A person is captured in an elegant, windswept studio portrait against a solid, textured, deep background. They are wearing a 90s vintage styled clothing. Their body is angled towards the camera, but their head is turned in a three-quarter view as they gaze thoughtfully upwards and away, their expression serene with slightly parted lips. Voluminous 80s vintage styled hair frames their face, catching the light and creating a sense of movement, while vintage style accessories adds a touch of detail. This is a tightly cropped, vertical medium close-up shot focusing on the person's head, neck, and shoulders, with the composition placing them slightly off-center. The camera is positioned at a slightly low angle, looking up at the subject, which adds to the poised and graceful mood. The overall style is photorealistic yet highly stylized, evoking a high-fashion, editorial, and vintage 90s glamour aesthetic with a grainy analog feel. The image has medium-high contrast, with rich, dark areas and soft but defined shadows that beautifully sculpt the subject's features, all under a balanced exposure. A deeply warm and saturated color palette dominates the image, with a consistent and strong golden-amber hue washing over the entire scene, creating a cohesive warm tonality with bold, rich colors. The photography has a distinct texture, giving it a nostalgic quality, film grain, grainy texture, analog, soft, hazy, vintage texture, soft glow, analog texture. The lighting is soft and directional, emanating from a warm light source positioned to the front and side, which illuminates the subject's face and creates a gentle, glowy effect while casting soft shadows, soft lighting, warm light, studio lighting, glowy lighting, directional lighting, soft shadows. Person: ${data.name}, a ${data.gender} ${data.ethnicity}, age ${data.age}. Distinctive features: ${data.eyeColor} eyes. Hair: ${data.hairColor} ${data.hairStyle}.`
  }
];

export const ConfirmLookScreen = ({ faceData, profileData, onNext, onBack, currentStep, totalSteps, onConfirmLookReady }: ConfirmLookScreenProps) => {
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [allGenerated, setAllGenerated] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState({
    name: faceData.name || "",
    age: faceData.age?.toString() || "",
    gender: faceData.gender || "",
    ethnicity: faceData.ethnicity || "",
    eyeColor: faceData.eyeColor || "",
    hairColor: faceData.hairColor || "",
    hairStyle: faceData.hairStyle || "",
    occupation: faceData.occupation || "",
    customPrompt: ""
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle select and continue action - memoized to prevent re-renders
  const handleSelectAndContinue = useCallback(() => {
    if (selectedStyle === null) {
      toast.error('Please select a style to continue');
      return;
    }

    const selectedImageUrl = generatedImages[selectedStyle];
    if (selectedImageUrl) {
      localStorage.setItem('generatedProfilePhoto', selectedImageUrl);
      onNext(selectedImageUrl);
    }
  }, [selectedStyle, generatedImages, onNext]);

  // Play confirm look audio once on mount
  useEffect(() => {
    if (!hasPlayedAudio) {
      const audio = new Audio('/audio/confirm-look.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));
      setHasPlayedAudio(true);
    }
  }, [hasPlayedAudio]);

  useEffect(() => {
    // Generate all 5 images when component mounts
    generateAllImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-select first image when all images are generated
  useEffect(() => {
    if (allGenerated && selectedStyle === null && Object.keys(generatedImages).length > 0) {
      const firstStyleId = styleOptions[0]?.id;
      if (firstStyleId && generatedImages[firstStyleId]) {
        setSelectedStyle(firstStyleId);
      }
    }
  }, [allGenerated, generatedImages, selectedStyle]);

  // Register hardware button action
  useEffect(() => {
    if (onConfirmLookReady) {
      if (selectedStyle !== null && allGenerated) {
        // Only register when user has selected a style and all images are generated
        onConfirmLookReady(() => handleSelectAndContinue);
      } else {
        // Clear the action when conditions are not met
        onConfirmLookReady(() => () => {});
      }
    }
  }, [onConfirmLookReady, selectedStyle, allGenerated, handleSelectAndContinue]);

  const generateAllImages = async () => {
    // Get the original image from faceData (passed from face scan)
    const originalImageBase64 = faceData.photo;
    if (!originalImageBase64) {
      toast.error('No captured selfie found');
      return;
    }

    const combinedData = { ...faceData, ...profileData };
    const isFemale = combinedData.gender?.toLowerCase() === 'female';

    // Initialize loading states
    const initialLoadingStates: Record<number, boolean> = {};
    styleOptions.forEach(style => {
      initialLoadingStates[style.id] = true;
    });
    setLoadingStates(initialLoadingStates);

    // Generate all images in parallel
    const generationPromises = styleOptions.map(async (style) => {
      try {
        let prompt = isFemale ? style.getFemalePrompt(combinedData) : style.getMalePrompt(combinedData);
        
        // Add custom prompt if exists
        if (combinedData.customPrompt) {
          prompt += ` Additional instructions: ${combinedData.customPrompt}`;
        }
        
        console.log(`Generating style ${style.id}: ${style.name}`);

        const { data, error } = await supabase.functions.invoke('generate-profile-photo', {
          body: {
            originalImageBase64,
            name: combinedData.name,
            gender: combinedData.gender,
            ethnicity: combinedData.ethnicity,
            eyeColor: combinedData.eyeColor,
            hairColor: combinedData.hairColor,
            hairStyle: combinedData.hairStyle,
            skinTone: combinedData.skinTone,
            facialHair: combinedData.facialHair,
            age: combinedData.age,
            occupation: combinedData.occupation,
            customPrompt: prompt
          }
        });

        if (error) {
          console.error(`Error generating style ${style.id}:`, error);
          toast.error(`Failed to generate ${style.name}`);
          setLoadingStates(prev => ({ ...prev, [style.id]: false }));
          return null;
        }

        if (data?.success && data?.editedImageUrl) {
          console.log(`Style ${style.id} generated successfully`);
          setGeneratedImages(prev => ({ ...prev, [style.id]: data.editedImageUrl }));
          setLoadingStates(prev => ({ ...prev, [style.id]: false }));
          return { id: style.id, url: data.editedImageUrl };
        } else {
          throw new Error(`Failed to generate style ${style.id}`);
        }
      } catch (error) {
        console.error(`Error generating style ${style.id}:`, error);
        setLoadingStates(prev => ({ ...prev, [style.id]: false }));
        toast.error(`Failed to generate ${style.name}`);
        return null;
      }
    });

    // Wait for all generations to complete
    const results = await Promise.all(generationPromises);
    const successCount = results.filter(r => r !== null).length;
    
    setAllGenerated(true);
    if (successCount === 5) {
      toast.success('All profile photos generated!');
    } else {
      toast.success(`Generated ${successCount} out of 5 photos`);
    }
  };

  const handleSaveEdit = async () => {
    // Validate inputs
    if (!editedData.name || !editedData.age || !editedData.gender) {
      toast.error('Please fill in required fields (name, age, gender)');
      return;
    }

    // Update faceData with edited values
    Object.assign(faceData, {
      name: editedData.name,
      age: parseInt(editedData.age),
      gender: editedData.gender,
      ethnicity: editedData.ethnicity,
      eyeColor: editedData.eyeColor,
      hairColor: editedData.hairColor,
      hairStyle: editedData.hairStyle,
      occupation: editedData.occupation,
      customPrompt: editedData.customPrompt
    });

    // Close edit mode
    setIsEditMode(false);
    
    // Clear current images and regenerate
    setGeneratedImages({});
    setSelectedStyle(null);
    setAllGenerated(false);
    
    toast.success('Regenerating photos with updated attributes...');
    await generateAllImages();
  };

  const handleCancelEdit = () => {
    // Reset to original data
    setEditedData({
      name: faceData.name || "",
      age: faceData.age?.toString() || "",
      gender: faceData.gender || "",
      ethnicity: faceData.ethnicity || "",
      eyeColor: faceData.eyeColor || "",
      hairColor: faceData.hairColor || "",
      hairStyle: faceData.hairStyle || "",
      occupation: faceData.occupation || "",
      customPrompt: ""
    });
    setIsEditMode(false);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <div className="h-full w-full bg-transparent text-beige flex flex-col relative overflow-hidden font-['SF_Mono',monospace]">
      {/* Header with Back Button and Progress */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-20">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-beige text-sm px-1 py-1 hover:text-beige/80 transition-colors"
        >
          <span className="text-base">﹤</span>
          <span>Back</span>
        </button>

        {/* Progress Dots */}
        <div className="flex gap-[5px] items-center">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`size-[3px] border border-beige/50 ${
                i + 1 === currentStep ? 'bg-beige' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Spacer */}
        <div className="w-[60px]" />
      </div>

      {/* Title and Description */}
      <div className="absolute top-[58px] left-0 right-0 px-6 z-10">
        <h2 className="text-[18px] font-bold text-beige leading-tight tracking-wide">
          CONFIRM YOUR LOOK
        </h2>
        <p className="text-[13px] text-beige/60 mt-2 leading-relaxed">
          → This is your chance to be reborn. Select your favorite:
        </p>
      </div>

      {/* Carousel Container */}
      <div className="absolute top-[120px] left-0 right-0 bottom-[100px] flex items-center justify-center">
        <div className="relative w-full h-[381px] flex items-center justify-center">
          {/* Left Side Image (Blurred) - Show previous image */}
          {selectedStyle !== null && selectedStyle > 1 && generatedImages[selectedStyle - 1] && (
            <div className="absolute left-[24px] top-[78px] w-[128px] h-[224px] rounded-[4px] overflow-hidden opacity-50 z-0">
              <img
                src={generatedImages[selectedStyle - 1]}
                alt="Previous style"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Center Image (Main) */}
          <div className="relative w-[218px] h-[381px] rounded-[24px] overflow-hidden shadow-2xl z-10 bg-black-bg/10">
            {selectedStyle !== null && generatedImages[selectedStyle] ? (
              <>
                <img
                  src={generatedImages[selectedStyle]}
                  alt={`Style ${selectedStyle}`}
                  className="w-full h-full object-cover"
                />
                {/* Green Checkmark Badge */}
                <div className="absolute bottom-[20px] right-[20px] w-[20px] h-[20px] bg-[#B7F699] flex items-center justify-center border border-black/10">
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6L5 8L9 4" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-black-bg/5 flex flex-col items-center justify-center gap-3 border border-beige/10">
                <Loader2 className="w-12 h-12 animate-spin text-beige" />
                <p className="text-xs text-beige/60">Generating...</p>
              </div>
            )}
          </div>

          {/* Right Side Image (Blurred) - Show next image */}
          {selectedStyle !== null && selectedStyle < styleOptions.length && generatedImages[selectedStyle + 1] && (
            <div className="absolute right-[24px] top-[78px] w-[128px] h-[224px] rounded-[4px] overflow-hidden opacity-50 z-0">
              <img
                src={generatedImages[selectedStyle + 1]}
                alt="Next style"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Left Navigation Button */}
          <button
            onClick={() => {
              if (selectedStyle !== null && selectedStyle > 1) {
                setSelectedStyle(selectedStyle - 1);
              }
            }}
            disabled={!selectedStyle || selectedStyle === 1}
            className="absolute left-[calc(50%-109px-28px)] top-1/2 -translate-y-1/2 w-[48px] h-[48px] rounded-full border border-beige/30 bg-black-bg/10 backdrop-blur-sm flex items-center justify-center hover:bg-black-bg/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed z-20"
          >
            <ChevronLeft className="w-5 h-5 text-beige" />
          </button>

          {/* Right Navigation Button */}
          <button
            onClick={() => {
              if (selectedStyle !== null && selectedStyle < styleOptions.length) {
                setSelectedStyle(selectedStyle + 1);
              }
            }}
            disabled={!selectedStyle || selectedStyle === styleOptions.length}
            className="absolute right-[calc(50%-109px-28px)] top-1/2 -translate-y-1/2 w-[48px] h-[48px] rounded-full border border-beige/30 bg-black-bg/10 backdrop-blur-sm flex items-center justify-center hover:bg-black-bg/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed z-20"
          >
            <ChevronRight className="w-5 h-5 text-beige" />
          </button>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="absolute bottom-[20px] left-0 right-0 flex items-center justify-center gap-3 px-6 z-10">
        <ChevronLeft className="w-[14px] h-[14px] text-beige" />
        <p className="text-[14px] text-beige text-center font-['SF_Mono',monospace]">
          Choose this identity
        </p>
        <ChevronRight className="w-[14px] h-[14px] text-beige" />
      </div>
    </div>
  );
};
