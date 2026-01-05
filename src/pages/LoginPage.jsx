import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const turnstileRef = useRef();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!captchaToken) {
      toast({ variant: 'destructive', title: 'CAPTCHA Required', description: 'Please complete the CAPTCHA.' });
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        throw new Error(signInError.message);
      }

      toast({ title: t('auth.login.success_title'), description: t('auth.login.success_desc') });
      navigate(from, { replace: true });

    } catch (error) {
      toast({ variant: 'destructive', title: t('auth.login.failed_title'), description: error.message });
      // Reset captcha
      setCaptchaToken('');
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('auth.login.title')} - Dead Matter Wiki</title>
      </Helmet>
      <div className="max-w-md mx-auto">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <div className="text-center mb-8">
            <LogIn className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="text-3xl font-bold text-white mt-4">{t('auth.login.title')}</h1>
            <p className="text-gray-400">{t('auth.login.subtitle')}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">{t('auth.login.email_label')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.login.password_label')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {/* CAPTCHA Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-center mb-4">
                <p className="text-white font-semibold">Security Verification</p>
              </div>
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey="0x4AAAAAACBDztgzMpZW91QL"
                  onSuccess={setCaptchaToken}
                  onExpire={() => setCaptchaToken('')}
                  options={{
                    appearance: 'always',
                    theme: 'dark'
                  }}
                />
              </div>
              {captchaToken && (
                <div className="text-center mt-4">
                  <p className="text-green-400 text-sm font-semibold flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Verified
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('auth.login.submit_button')}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            {t('auth.login.no_account')}{' '}
            <Button variant="link" asChild className="p-0 h-auto text-red-400">
              <Link to="/register">{t('auth.login.register_link')}</Link>
            </Button>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
