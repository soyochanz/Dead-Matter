import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, Cookie } from 'lucide-react';

const PrivacyPolicyContent = () => (
    <div className="text-sm text-gray-400 space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
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
    <div className="text-sm text-gray-400 space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
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
    <div className="text-sm text-gray-400 space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
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
    const { t } = useTranslation();
    return (
        <footer className="relative mt-24 border-t border-white/5 py-12 overflow-hidden">
            {/* Technical Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.005]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="relative max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 z-10">
                <div className="text-center md:text-left">
                    <p className="text-xs text-gray-500 font-medium tracking-wide">
                        © 2026 <span className="text-white">Deadmatterwiki.com</span>. {t('footer.rights_reserved')}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">
                        Made with <span className="text-red-500 animate-pulse">❤</span> by <a href="https://ignaciomartin.site" target="_blank" rel="noopener noreferrer" className="text-red-400/80 hover:text-red-400 transition-colors font-bold hover:underline decoration-red-500/30 underline-offset-4">ignaciomartin.site</a>
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider px-4">
                            <Shield className="mr-2 h-3 w-3 text-gray-500" />
                            Legal & Privacy
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0a0a0c] border border-white/10 text-white max-w-2xl shadow-2xl">
                        <DialogHeader className="border-b border-white/5 pb-4">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Legal Information</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="privacy" className="w-full mt-4">
                            <TabsList className="bg-white/5 border border-white/5">
                                <TabsTrigger value="privacy" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Privacy</TabsTrigger>
                                <TabsTrigger value="terms" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Terms</TabsTrigger>
                                <TabsTrigger value="cookies" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Cookies</TabsTrigger>
                            </TabsList>
                            <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                <TabsContent value="privacy" className="mt-0 focus-visible:outline-none"><PrivacyPolicyContent /></TabsContent>
                                <TabsContent value="terms" className="mt-0 focus-visible:outline-none"><TermsOfServiceContent /></TabsContent>
                                <TabsContent value="cookies" className="mt-0 focus-visible:outline-none"><CookiePolicyContent /></TabsContent>
                            </div>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </div>
        </footer>
    );
};

export default Footer;
