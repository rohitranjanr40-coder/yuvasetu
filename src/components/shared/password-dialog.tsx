
"use client";

import React, { useState } from "react";
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
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import type { SectionVisibility } from "../layout/header";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionVisibility: SectionVisibility;
  setSectionVisibility: React.Dispatch<React.SetStateAction<SectionVisibility>>;
}

type View = "create" | "login" | "unlocked";

export function PasswordDialog({ 
  open, 
  onOpenChange, 
  sectionVisibility, 
  setSectionVisibility 
}: PasswordDialogProps) {
  // In a real app, you'd check if a password is set.
  const [view, setView] = useState<View>("create"); 
  
  // In a real app, you'd handle form submission and validation here.
  const handleSetPassword = () => {
    console.log("Setting password...");
    // Add logic to save the password securely
    setView("login"); // Switch to login view after setting
  };

  const handleLogin = () => {
    console.log("Login attempt");
    // Add password validation logic
    setView("unlocked"); // On success, show the unlocked view
  };

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
                Set a password to protect locked page sections.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-between">
              <Button variant="link" onClick={() => setView("login")}>
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
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-between">
               <Button variant="link" onClick={() => setView("create")}>
                Forgot password? Reset
              </Button>
              <Button type="submit" onClick={handleLogin}>Login</Button>
            </DialogFooter>
          </>
        )}

        {view === "unlocked" && (
            <>
                <DialogHeader>
                    <DialogTitle>Lock Sections</DialogTitle>
                    <DialogDescription>
                        Select the page sections you want to hide from public view.
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
                    <Button variant="ghost" onClick={() => setView("login")}>
                        Lock & Logout
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>Apply Changes</Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
