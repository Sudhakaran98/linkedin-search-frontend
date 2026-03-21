import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGetProfileDetail } from "@workspace/api-client-react";
import { MapPin, Link as LinkIcon, Building2, Briefcase, GraduationCap, Users, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

interface ProfileDetailDialogProps {
  profileId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDetailDialog({ profileId, isOpen, onOpenChange }: ProfileDetailDialogProps) {
  const { data: profile, isLoading, error } = useGetProfileDetail(profileId as string, {
    query: {
      enabled: !!profileId && isOpen,
    },
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Present";
    try {
      // Handle YYYY-MM-DD or just YYYY
      if (dateStr.length === 4) return dateStr;
      return format(parseISO(dateStr), "MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatDuration = (months?: number) => {
    if (!months) return "";
    const yrs = Math.floor(months / 12);
    const mos = months % 12;
    if (yrs > 0 && mos > 0) return `${yrs} yr ${mos} mos`;
    if (yrs > 0) return `${yrs} yr`;
    return `${mos} mos`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background max-h-[90vh] flex flex-col rounded-2xl">
        <DialogTitle className="sr-only">Profile Details</DialogTitle>
        <DialogDescription className="sr-only">Detailed view of the professional's profile</DialogDescription>
        
        {/* Header Background */}
        <div className="h-32 w-full bg-gradient-to-r from-primary/80 to-primary relative flex-shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="overflow-y-auto flex-1 pb-10 px-6 sm:px-10">
          {isLoading ? (
            <div className="mt-[-40px] space-y-6">
              <Skeleton className="w-24 h-24 rounded-full border-4 border-background" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-32 w-full mt-6" />
            </div>
          ) : error ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Failed to load profile</h3>
              <p className="mt-2">The profile could not be retrieved from the server.</p>
            </div>
          ) : profile ? (
            <div className="relative mt-[-48px]">
              {/* Profile Header section */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-lg mb-4 bg-white">
                    <AvatarImage src={profile.picture_url || ""} alt={profile.full_name} className="object-cover" />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary font-display font-semibold">
                      {profile.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
                    {profile.full_name}
                  </h1>
                  <p className="text-lg text-foreground/80 mt-1 font-medium">{profile.headline}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    {(profile.location_full || profile.location_city || profile.location_country) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {profile.location_full || [profile.location_city, profile.location_country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {profile.connections_count !== undefined && (
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {profile.connections_count}500+ connections
                      </span>
                    )}
                  </div>
                </div>
                
                {profile.linkedin_url && (
                  <a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <LinkIcon className="w-4 h-4" />
                    View LinkedIn
                  </a>
                )}
              </div>

              {/* Summary */}
              {profile.summary && (
                <div className="mb-10 bg-muted/30 rounded-2xl p-6 border border-border/50">
                  <h2 className="text-xl font-display font-bold mb-3 flex items-center gap-2">
                    About
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {profile.summary}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-10">
                  
                  {/* Experience Section */}
                  {profile.experiences && profile.experiences.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2 border-b pb-3">
                        <Briefcase className="w-6 h-6 text-primary" />
                        Experience
                      </h2>
                      <div className="space-y-8 pl-2">
                        {profile.experiences.map((exp, idx) => (
                          <div key={exp.id || idx} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-[-2rem] before:w-0.5 before:bg-border last:before:bottom-0">
                            <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10" />
                            
                            <div className="flex flex-col sm:flex-row gap-4 mb-2">
                              {exp.company_logo_url ? (
                                <img src={exp.company_logo_url} alt={exp.company_name} className="w-12 h-12 object-contain rounded-md border bg-white p-1 shadow-sm shrink-0" />
                              ) : (
                                <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0 border shadow-sm">
                                  <Building2 className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                              
                              <div>
                                <h3 className="text-lg font-bold text-foreground leading-tight">{exp.position_title}</h3>
                                <div className="text-md font-medium text-foreground/80">{exp.company_name}</div>
                                <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-2">
                                  <span>{formatDate(exp.date_from)} - {formatDate(exp.date_to)}</span>
                                  {exp.duration_months && (
                                    <>
                                      <span className="hidden sm:inline">•</span>
                                      <span>{formatDuration(exp.duration_months)}</span>
                                    </>
                                  )}
                                  {exp.location && (
                                    <>
                                      <span className="hidden sm:inline">•</span>
                                      <span>{exp.location}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {exp.description && (
                              <p className="text-sm text-muted-foreground mt-3 pl-0 sm:pl-16 whitespace-pre-wrap">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Education Section */}
                  {profile.educations && profile.educations.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2 border-b pb-3">
                        <GraduationCap className="w-6 h-6 text-primary" />
                        Education
                      </h2>
                      <div className="space-y-6">
                        {profile.educations.map((edu, idx) => (
                          <div key={edu.id || idx} className="flex gap-4">
                            {edu.institution_logo_url ? (
                              <img src={edu.institution_logo_url} alt={edu.institution_name} className="w-12 h-12 object-contain rounded-md border bg-white p-1 shadow-sm shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0 border shadow-sm">
                                <GraduationCap className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-bold text-foreground leading-tight">{edu.institution_name}</h3>
                              <div className="text-md text-foreground/80 mt-0.5">{edu.degree}</div>
                              {(edu.date_from_year || edu.date_to_year) && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {edu.date_from_year} - {edu.date_to_year || "Present"}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                  {/* Skills Section */}
                  {profile.skills && profile.skills.length > 0 && (
                    <section className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
                      <h2 className="text-lg font-display font-bold mb-4">Skills & Endorsements</h2>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="bg-primary/5 text-primary hover:bg-primary/10 border-primary/10 px-3 py-1 font-medium transition-colors cursor-default"
                          >
                            {skill.skill_name}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}
                  
                  {/* Quick Stats/Highlights */}
                  <section className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
                    <h2 className="text-lg font-display font-bold mb-4">Highlights</h2>
                    <div className="space-y-4">
                      {profile.total_experience_duration_months && (
                        <div>
                          <div className="text-sm text-muted-foreground">Total Experience</div>
                          <div className="font-medium text-foreground">{formatDuration(profile.total_experience_duration_months)}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-muted-foreground">Current Status</div>
                        <div className="font-medium text-foreground">
                          {profile.active_experience_title ? "Actively Employed" : "Open to opportunities"}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
