
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User as CustomUserType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from './use-toast';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from "firebase/auth";
import { app } from '@/lib/firebase';
import { getUsers, getUserByFirebaseUid, saveNewUser } from '@/lib/actions';


const auth = getAuth(app);


interface AuthContextType {
  user: CustomUserType | null;
  firebaseUser: FirebaseUser | null;
  logout: () => void;
  users: CustomUserType[];
  updateUser: (user: CustomUserType) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUserType | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [users, setUsers] = useState<CustomUserType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const refreshUser = useCallback(async () => {
    if (firebaseUser) {
        setLoading(true);
        const updatedUser = await getUserByFirebaseUid(firebaseUser.uid);
        if (updatedUser) {
            setUser(updatedUser as CustomUserType);
        }
        setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    async function fetchInitialData() {
        const allUsers = await getUsers() as CustomUserType[];
        setUsers(allUsers);
    }
    fetchInitialData();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
            const customUser = await getUserByFirebaseUid(fbUser.uid) as CustomUserType;
            if (customUser) {
                setUser(customUser);
            } else {
                // This case is for when a user exists in Firebase Auth but not in our DB yet.
                // We create a temporary user object. `saveNewUser` will handle the DB record.
                setUser({
                    id: 0, // Placeholder, real ID comes from DB
                    firebaseUid: fbUser.uid,
                    name: fbUser.displayName || 'New User',
                    email: fbUser.email!,
                    avatarUrl: fbUser.photoURL || `https://placehold.co/40x40.png?text=${fbUser.email![0].toUpperCase()}`,
                    joiners: 0,
                    role: 'user', // Default role
                    bannerUrl: null,
                    galleryPhotos: [],
                });
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };
  
  const updateUser = async (userToUpdate: CustomUserType) => {
    // This function would ideally trigger a server action to update the user in DB
    const updatedUsers = users.map(u => u.id === userToUpdate.id ? userToUpdate : u);
    setUsers(updatedUsers);
    if (user && user.id === userToUpdate.id) {
        setUser(userToUpdate);
    }
  }
  
  const refreshUsersAndLogin = async () => {
    const allUsers = await getUsers() as CustomUserType[];
    setUsers(allUsers);
    if(firebaseUser) {
        const customUser = allUsers.find((u: CustomUserType) => u.firebaseUid === firebaseUser.uid);
        if(customUser) setUser(customUser);
    }
  }

  return (
    <AuthContext.Provider value={{ user, firebaseUser, logout, users, updateUser, loading, refreshUser }}>
      {children}
      <AuthDialog onAuthSuccess={refreshUsersAndLogin} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


function AuthDialog({ onAuthSuccess }: { onAuthSuccess: () => void }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const openSwitcher = () => setIsDialogOpen(true);
        window.addEventListener('open-user-switcher', openSwitcher);
        return () => window.removeEventListener('open-user-switcher', openSwitcher);
    }, []);

    const handleAuthAction = async () => {
        if (!email || !password) {
            toast({ variant: 'destructive', title: 'Email and password are required.' });
            return;
        }
        if (isSigningUp && !name) {
            toast({ variant: 'destructive', title: 'Name is required for sign up.' });
            return;
        }
        
        try {
            if (isSigningUp) {
                // Sign Up
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                const newUser = {
                    firebaseUid: userCredential.user.uid,
                    name: name,
                    email: email,
                    avatarUrl: `https://placehold.co/40x40.png?text=${name.charAt(0).toUpperCase()}`,
                    joiners: 0,
                    role: 'user' as 'user' | 'admin',
                };
                
                await saveNewUser(newUser);
                
                onAuthSuccess();
                
                toast({ title: "Account created successfully!", description: "You are now logged in."});

            } else {
                // Sign In
                await signInWithEmailAndPassword(auth, email, password);
                onAuthSuccess(); // Refresh user list and trigger re-render
                toast({ title: "Logged in successfully!" });
            }
            closeDialog();

        } catch (error: any) {
            console.error("Authentication error:", error);
            const errorMessage = error.message.includes('auth/invalid-credential') 
                ? "Incorrect email or password."
                : error.message.includes('auth/email-already-in-use')
                ? "This email is already registered. Please log in."
                : "An error occurred. Please try again.";
            toast({ variant: 'destructive', title: 'Authentication Failed', description: errorMessage });
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        // Reset form after closing
        setTimeout(() => {
            setIsSigningUp(false);
            setEmail('');
            setPassword('');
            setName('');
        }, 300);
    }

    const title = isSigningUp ? "Create an Account" : "Sign In";
    const description = isSigningUp ? "Enter your details to create a new account." : "Enter your credentials to access your account.";

    return (
        <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {isSigningUp && (
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                </div>
                <DialogFooter className="pt-4 border-t flex-col sm:flex-row sm:justify-between items-center">
                    <Button variant="link" className="p-0 h-auto" onClick={() => setIsSigningUp(!isSigningUp)}>
                        {isSigningUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </Button>
                    <Button onClick={handleAuthAction}>
                        {isSigningUp ? "Sign Up" : "Sign Up"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
