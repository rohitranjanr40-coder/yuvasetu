
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { SectionVisibility } from "./header";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionVisibility: SectionVisibility;
  setSectionVisibility: React.Dispatch<React.SetStateAction<SectionVisibility>>;
}

type View = "create" | "login" | "unlocked";
const PASSWORD_KEY = "yuvasetu_lock_password";

export function PasswordDialog({
  open,
  onOpenChange,
  sectionVisibility,
  setSectionVisibility
}: PasswordDialogProps) {
  const [view, setView] = useState<View>("create");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const savedPassword = localStorage.getItem(PASSWORD_KEY);
      if (savedPassword) {
        setView("login");
      } else {
        setView("create");
      }
      setPassword("");
      setConfirmPassword("");
    }
  }, [open]);

  const handleSetPassword = () => {
    if (password.length < 4) {
      toast({ variant: "destructive", title: "Password Too Short", description: "Please use at least 4 characters." });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords Do Not Match", description: "Please re-enter your password." });
      return;
    }
    localStorage.setItem(PASSWORD_KEY, password);
    toast({ title: "Password Set Successfully!", description: "You can now log in to manage sections." });
    setView("login");
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogin = () => {
    const savedPassword = localStorage.getItem(PASSWORD_KEY);
    if (password === savedPassword) {
      toast({ title: "Login Successful!" });
      setView("unlocked");
    } else {
      toast({ variant: "destructive", title: "Incorrect Password" });
    }
    setPassword("");
  };

  const handleLogout = () => {
      setPassword("");
      setView("login");
  }

  const handleResetPassword = () => {
      localStorage.removeItem(PASSWORD_KEY);
      toast({ title: "Password Reset", description: "You can now create a new password." });
      setView("create");
  }

  const handleCheckboxChange = (section: keyof SectionVisibility) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections: { id: keyof SectionVisibility; label: string }[] = [
      { id: 'mainStream', label: 'Main Stream' },
      { id: 'educational', label: 'Educational' },
      { id: 'farmer', label: 'Farmer' },
      { id: 'children', label: 'Children' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {view === "create" && (
          <>
            <DialogHeader>
              <DialogTitle>Create Lock Password</DialogTitle>
              <DialogDescription>
                Set a password to protect and manage page sections.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <Button variant="link" className="p-0 h-auto" onClick={() => setView("login")}>
                Already have a password? Login
              </Button>
              <Button type="submit" onClick={handleSetPassword}>Set Password</Button>
            </DialogFooter>
          </>
        )}

        {view === "login" && (
          <>
            <DialogHeader>
              <DialogTitle>Unlock Sections</DialogTitle>
              <DialogDescription>
                Enter the password to manage locked sections.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="link" className="p-0 h-auto">Forgot password?</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove your current password. You will need to create a new one.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetPassword}>Reset Password</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              <Button type="submit" onClick={handleLogin}>Login</Button>
            </DialogFooter>
          </>
        )}

        {view === "unlocked" && (
            <>
                <DialogHeader>
                    <DialogTitle>Manage Section Visibility</DialogTitle>
                    <DialogDescription>
                        Select the page sections you want to show in the header.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {sections.map(section => (
                         <div className="flex items-center space-x-3" key={section.id}>
                            <Checkbox
                                id={`lock-${section.id}`}
                                checked={sectionVisibility[section.id]}
                                onCheckedChange={() => handleCheckboxChange(section.id)}
                            />
                            <Label htmlFor={`lock-${section.id}`} className="font-normal">{section.label}</Label>
                        </div>
                    ))}
                </div>
                <Separator />
                <DialogFooter className="flex-col sm:flex-row sm:justify-between">
                    <Button variant="ghost" onClick={handleLogout}>
                        Lock & Logout
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>Apply & Close</Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
