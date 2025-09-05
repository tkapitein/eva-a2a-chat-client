import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Settings } from "lucide-react";
import { setA2ACardUrl, setA2AAuthorizationToken } from "~/lib/get-a2a-client";

const STORAGE_KEY_DOMAIN = "a2a_client_domain";
const STORAGE_KEY_TOKEN = "a2a_auth_token";
const DEFAULT_DOMAIN = "http://localhost:9999";

// Check if settings are configured
export function areSettingsConfigured(): boolean {
  if (typeof window === "undefined") return false;
  const domain = localStorage.getItem(STORAGE_KEY_DOMAIN);
  const token = localStorage.getItem(STORAGE_KEY_TOKEN);
  return !!(domain && token);
}

export function SettingsDialog() {
  const [open, setOpen] = React.useState(false);
  const [domain, setDomain] = React.useState("");
  const [token, setToken] = React.useState("");
  const [hasLoadedSettings, setHasLoadedSettings] = React.useState(false);

  // Load settings from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDomain = localStorage.getItem(STORAGE_KEY_DOMAIN) || "";
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN) || "";
      setDomain(savedDomain);
      setToken(savedToken);
      setHasLoadedSettings(true);
      
      // Apply saved settings to the A2A client if both are present
      if (savedDomain && savedToken) {
        const fullUrl = `${savedDomain}/.well-known/agent-card.json`;
        setA2ACardUrl(fullUrl);
        setA2AAuthorizationToken(savedToken);
      }
    }
  }, []);

  const handleSave = () => {
    // Validate required fields
    if (!domain || !token) {
      return;
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY_DOMAIN, domain);
    localStorage.setItem(STORAGE_KEY_TOKEN, token);

    // Apply to A2A client
    const fullUrl = `${domain}/.well-known/agent-card.json`;
    setA2ACardUrl(fullUrl);
    setA2AAuthorizationToken(token);

    setOpen(false);
    // Reload to apply settings
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>A2A Client Settings</DialogTitle>
          <DialogDescription>
            Configure the A2A client endpoint and authentication. Both fields are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="domain">A2A Server Domain</Label>
            <Input
              id="domain"
              type="url"
              placeholder="http://localhost:9999"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="token">Authorization Token (Required)</Label>
            <Input
              id="token"
              type="password"
              placeholder="Enter your bearer token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={!domain || !token}
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}