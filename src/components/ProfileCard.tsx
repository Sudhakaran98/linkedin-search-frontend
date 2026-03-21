import React from "react";
import { ProfileCard as ProfileCardType } from "@workspace/api-client-react";
import { Building2, MapPin, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileCardProps {
  profile: ProfileCardType;
  onClick: (id: string) => void;
}

export function ProfileCard({ profile, onClick }: ProfileCardProps) {
  return (
    <div 
      onClick={() => onClick(profile.id)}
      className="group bg-card hover:bg-card/90 rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/40 group-hover:via-primary group-hover:to-primary/40 transition-all duration-500"></div>
      
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="w-16 h-16 border-2 border-background shadow-sm bg-white shrink-0 group-hover:scale-105 transition-transform duration-300">
          <AvatarImage src={profile.picture_url || ""} alt={profile.full_name} className="object-cover" />
          <AvatarFallback className="text-xl bg-primary/10 text-primary font-display font-medium">
            {profile.full_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 pr-12">
          <h3 className="text-lg font-display font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {profile.full_name}
          </h3>
          <p className="text-sm text-foreground/80 line-clamp-2 mt-0.5 leading-snug">
            {profile.headline}
          </p>
        </div>
        
        {profile.score !== undefined && (
          <div className="absolute top-5 right-5">
            <Badge variant="outline" className="bg-amber-50/50 text-amber-700 border-amber-200/50 flex items-center gap-1 backdrop-blur-sm shadow-sm font-semibold">
              <Award className="w-3.5 h-3.5" />
              {(profile.score).toFixed(1)}
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-auto space-y-3 pt-4 border-t border-border/50">
        {(profile.active_experience_title || profile.active_experience_company_name) && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            {profile.active_experience_company_logo_url ? (
              <img src={profile.active_experience_company_logo_url} alt="" className="w-5 h-5 rounded object-contain bg-white" />
            ) : (
              <Building2 className="w-4 h-4 shrink-0 text-primary/60" />
            )}
            <span className="truncate flex-1 font-medium text-foreground/80">
              {profile.active_experience_title}
              {profile.active_experience_title && profile.active_experience_company_name && " at "}
              {profile.active_experience_company_name}
            </span>
          </div>
        )}

        {(profile.location_full || profile.location_city) && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 text-primary/60" />
            <span className="truncate flex-1">
              {profile.location_full || [profile.location_city, profile.location_country].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
