import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Upload, X } from "lucide-react";
import { addMember } from "@/lib/chit-store";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/utils";

const AddMemberDialog = ({ onAdded }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const fileRef = useRef();
  const { toast } = useToast();

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 300, 0.7);
      setProfileImage(compressed);
    } catch {
      toast({ title: "Failed to load image", variant: "destructive" });
    }
  };

  const reset = () => {
    setName(""); setPhone(""); setEmail(""); setAadhaar(""); setProfileImage(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    addMember({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      aadhaar: aadhaar.trim(),
      profileImage: profileImage ?? null,
    });
    toast({ title: "Member added successfully!" });
    reset();
    setOpen(false);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Profile Image */}
          <div className="space-y-2">
            <Label>Profile Photo <span className="text-muted-foreground text-xs">(optional)</span></Label>
            {profileImage ? (
              <div className="relative w-24 h-24">
                <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -top-1 -right-1 h-6 w-6 bg-background border rounded-full"
                  onClick={() => { setProfileImage(null); fileRef.current.value = ""; }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs"
              >
                <Upload className="h-5 w-5" />
                Upload
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aadhaar">Aadhaar Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              id="aadhaar"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
              placeholder="XXXX XXXX XXXX"
              maxLength={14}
            />
          </div>
          <Button type="submit" className="w-full">Add Member</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
