'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { User as UserIcon, MapPin, Phone, Mail, Building, GraduationCap, Pencil, Save, X } from 'lucide-react';

interface Education {
    institution: string;
    degree: string;
    year: string;
}

interface Workplace {
    company: string;
    role: string;
    duration: string;
}

interface UserProfile {
    displayName: string;
    country: string;
    email: string;
    phone: string;
    education: Education[];
    workplace: Workplace[];
}

export default function ProfileSection() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile>({
        displayName: '',
        country: '',
        email: '',
        phone: '',
        education: [],
        workplace: []
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id, session.user);
            } else {
                setLoading(false);
            }
        };
        getProfile();
    }, []);

    const fetchProfile = async (uid: string, authUser: User) => {
        setLoading(true);

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', uid)
            .single();

        if (data) {
            setProfile({
                displayName: data.display_name || '',
                country: data.country || '',
                email: authUser.email || '',
                phone: data.phone || '',
                education: data.education || [],
                workplace: data.workplace || []
            });
        } else {
            // Initialize with auth data
            setProfile(prev => ({
                ...prev,
                displayName: authUser.user_metadata?.full_name || '',
                email: authUser.email || ''
            }));
        }
        setLoading(false);
    };

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user) return;

        // Optimistic Update: Update UI immediately
        setIsEditing(false);
        setSaving(true);

        try {
            const { error } = await supabase.from('users').upsert({
                id: user.id,
                display_name: profile.displayName,
                country: profile.country,
                phone: profile.phone,
                education: profile.education,
                workplace: profile.workplace,
                updated_at: new Date().toISOString(),
            });

            if (error) throw error;
        } catch (error: any) {
            console.error("Error saving profile:", error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const updateEducation = (index: number, field: keyof Education, value: string) => {
        const newEducation = [...profile.education];
        newEducation[index] = { ...newEducation[index], [field]: value };
        setProfile({ ...profile, education: newEducation });
    };

    const addEducation = () => {
        setProfile({
            ...profile,
            education: [...profile.education, { institution: '', degree: '', year: '' }]
        });
    };

    const removeEducation = (index: number) => {
        const newEducation = profile.education.filter((_, i) => i !== index);
        setProfile({ ...profile, education: newEducation });
    };

    const updateWorkplace = (index: number, field: keyof Workplace, value: string) => {
        const newWorkplace = [...profile.workplace];
        newWorkplace[index] = { ...newWorkplace[index], [field]: value };
        setProfile({ ...profile, workplace: newWorkplace });
    };

    const addWorkplace = () => {
        setProfile({
            ...profile,
            workplace: [...profile.workplace, { company: '', role: '', duration: '' }]
        });
    };

    const removeWorkplace = (index: number) => {
        const newWorkplace = profile.workplace.filter((_, i) => i !== index);
        setProfile({ ...profile, workplace: newWorkplace });
    };

    if (loading) return <div>Loading Profile...</div>;
    if (!user) return <div>Please sign in to view your dashboard.</div>;

    return (
        <div className="glass-panel rounded-xl overflow-hidden transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold">Professional Profile</h2>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={saving}
                    className={`glass-button flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditing
                        ? 'border border-white/20'
                        : ''
                        }`}
                >
                    {isEditing ? (
                        saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>
                    ) : (
                        <><Pencil className="w-4 h-4" /> Edit Profile</>
                    )}
                </button>
            </div>

            <div className="p-6 space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            {user.user_metadata?.avatar_url ? (
                                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700">
                                    <Image
                                        src={user.user_metadata.avatar_url}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <UserIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.displayName}
                                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                                        className="w-full glass-input px-3 py-2 border rounded-md"
                                        placeholder="Your Name"
                                    />
                                ) : (
                                    <div className="font-medium text-lg text-gray-900 dark:text-white">{profile.displayName || 'Not set'}</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Location</label>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.country}
                                        onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                                        className="w-full glass-input px-3 py-2 border rounded-md"
                                        placeholder="Country/Region"
                                    />
                                ) : (
                                    <span className="text-gray-700 dark:text-gray-300">{profile.country || 'Not set'}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Contact</label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full glass-input px-3 py-2 border rounded-md"
                                            placeholder="Phone Number"
                                        />
                                    ) : (
                                        <span className="text-gray-700 dark:text-gray-300">{profile.phone || 'Not set'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        Education
                    </h3>
                    <div className="space-y-4">
                        {profile.education.map((edu, idx) => (
                            <div key={idx} className="flex gap-4 items-start bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-transparent dark:border-gray-700">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {isEditing ? (
                                        <>
                                            <input
                                                placeholder="Institution"
                                                value={edu.institution}
                                                onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                                                className="glass-input px-3 py-2 border rounded"
                                            />
                                            <input
                                                placeholder="Degree"
                                                value={edu.degree}
                                                onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                                className="glass-input px-3 py-2 border rounded"
                                            />
                                            <input
                                                placeholder="Year"
                                                value={edu.year}
                                                onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                                                className="glass-input px-3 py-2 border rounded"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div className="font-medium text-gray-900 dark:text-white">{edu.institution}</div>
                                            <div className="text-gray-600 dark:text-gray-400">{edu.degree}</div>
                                            <div className="text-gray-500 dark:text-gray-500">{edu.year}</div>
                                        </>
                                    )}
                                </div>
                                {isEditing && (
                                    <button onClick={() => removeEducation(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {isEditing && (
                            <button onClick={addEducation} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                + Add Education
                            </button>
                        )}
                        {profile.education.length === 0 && !isEditing && <p className="text-gray-500 italic">No education details added.</p>}
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                        <Building className="w-5 h-5 text-blue-600" />
                        Work Experience
                    </h3>
                    <div className="space-y-4">
                        {profile.workplace.map((work, idx) => (
                            <div key={idx} className="flex gap-4 items-start bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-transparent dark:border-gray-700">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {isEditing ? (
                                        <>
                                            <input
                                                placeholder="Company"
                                                value={work.company}
                                                onChange={(e) => updateWorkplace(idx, 'company', e.target.value)}
                                                className="glass-input px-3 py-2 border rounded"
                                            />
                                            <input
                                                placeholder="Role"
                                                value={work.role}
                                                onChange={(e) => updateWorkplace(idx, 'role', e.target.value)}
                                                className="glass-input px-3 py-2 border rounded"
                                            />
                                            <input
                                                placeholder="Duration"
                                                value={work.duration}
                                                onChange={(e) => updateWorkplace(idx, 'duration', e.target.value)}
                                                className="glass-input px-3 py-2 border rounded"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div className="font-medium text-gray-900 dark:text-white">{work.company}</div>
                                            <div className="text-gray-600 dark:text-gray-400">{work.role}</div>
                                            <div className="text-gray-500 dark:text-gray-500">{work.duration}</div>
                                        </>
                                    )}
                                </div>
                                {isEditing && (
                                    <button onClick={() => removeWorkplace(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {isEditing && (
                            <button onClick={addWorkplace} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                + Add Workplace
                            </button>
                        )}
                        {profile.workplace.length === 0 && !isEditing && <p className="text-gray-500 italic">No work experience added.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
