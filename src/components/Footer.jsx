import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PrivacyPolicyContent = () => (
    <div className="text-sm text-gray-400 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
        <h3 className="font-bold text-lg text-white">Privacy Policy</h3>
        <p>This website is a fan-made project and is not affiliated with the official Dead Matter development team. Our commitment is to protect your privacy.</p>
        <p>We collect information you provide directly to us when you create a user account for administrative purposes or save a character build preset. This may include your email address and any build configurations you choose to save locally in your browser.</p>
        <p>We use Cloudflare Turnstile to protect our forms from spam, which may collect anonymous data to verify that you are human. We do not collect personal data from this service.</p>
        <h3 className="font-bold text-lg text-white">How We Use Information</h3>
        <p>Your email is used solely for authentication and to allow you to manage wiki content if you are an administrator. Build presets are stored in your browser's local storage and are not transmitted to our servers unless you choose to share them via a generated link.</p>
        <h3 className="font-bold text-lg text-white">Sharing of Information</h3>
        <p>We do not share your personal information with third parties. All data related to your account is stored securely with our BaaS provider (Supabase).</p>
    </div>
);

const TermsOfServiceContent = () => (
    <div className="text-sm text-gray-400 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
        <h3 className="font-bold text-lg text-white">Terms of Service</h3>
        <p>By using Deadmatterwiki.com, you agree to these terms. This is a community-driven wiki for the game Dead Matter. All content is provided for informational purposes.</p>
        <h3 className="font-bold text-lg text-white">Content Accuracy</h3>
        <p>While we strive for accuracy, the information on this wiki is based on game data and community contributions, which may change with game updates. We are not responsible for any inaccuracies or for gameplay decisions made based on this information.</p>
        <h3 className="font-bold text-lg text-white">User Conduct</h3>
        <p>Users with administrative access are expected to contribute constructively. Vandalism, posting of inappropriate content, or misuse of administrative privileges will result in account termination.</p>
        <h3 className="font-bold text-lg text-white">Disclaimer</h3>
        <p>Deadmatterwiki.com is an independent, unofficial fan-site. It is not affiliated with, endorsed, or sponsored by QI Games. All game-related trademarks, content, and imagery are the property of their respective owners.</p>
    </div>
);

const CookiePolicyContent = () => (
    <div className="text-sm text-gray-400 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
        <h3 className="font-bold text-lg text-white">Cookie Policy</h3>
        <p>We use modern browser technologies to enhance your experience. This site utilizes browser Local Storage and authentication tokens from our backend provider (Supabase).</p>
        <h3 className="font-bold text-lg text-white">Local Storage</h3>
        <p>We use Local Storage to save your character build presets directly in your browser. This data is not sent to our servers and remains private to you unless you explicitly share it.</p>
        <h3 className="font-bold text-lg text-white">Authentication Tokens</h3>
        <p>If you are an administrator, our authentication provider (Supabase) uses tokens (similar to cookies) to keep you logged in securely. These are essential for the site's administrative functions and do not track your activity across other sites.</p>
        <h3 className="font-bold text-lg text-white">Your Choices</h3>
        <p>By using this site, you consent to the use of these technologies. You can clear your local storage and authentication tokens at any time through your browser settings, which will log you out and delete any saved presets.</p>
    </div>
);


const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-400 py-8 mt-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 text-center relative flex justify-between items-center">
        <p className="text-sm">
          © 2026 Deadmatterwiki.com. All Rights Reserved. Made with love ❤️ by <a href="https://ignaciomartin.site" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">ignaciomartin.site</a>
        </p>

        <div className="flex items-center gap-4">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Legal & Privacy</Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Legal Information</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="privacy" className="w-full mt-4">
                        <TabsList>
                            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                            <TabsTrigger value="cookies">Cookie Policy</TabsTrigger>
                        </TabsList>
                        <TabsContent value="privacy" className="pt-4"><PrivacyPolicyContent /></TabsContent>
                        <TabsContent value="terms" className="pt-4"><TermsOfServiceContent /></TabsContent>
                        <TabsContent value="cookies" className="pt-4"><CookiePolicyContent /></TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
      </div>
    </footer>
  );
};

export default Footer;