import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
import { Turnstile } from '@marsidev/react-turnstile';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const turnstileRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!captchaToken) {
      toast({ variant: 'destructive', title: 'CAPTCHA Required', description: 'Please complete the CAPTCHA.' });
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError, data } = await signUp(email, password, {
        data: {
          username: username,
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ username: username })
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Error updating profile username:', profileError);
        }

        toast({ title: t('auth.register.success_title'), description: t('auth.register.success_desc') });
        navigate('/');

      } else {
        throw new Error('User registration did not return a user object.');
      }

    } catch (error) {
      if (!error.message.includes('Sign up Failed')) {
        toast({ variant: 'destructive', title: t('auth.register.failed_title'), description: error.message });
      }
      setCaptchaToken('');
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
      setCaptchaKey(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('auth.register.title')} - Dead Matter Wiki</title>
      </Helmet>
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <div className="text-center mb-8">
            <UserPlus className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="text-3xl font-bold text-white mt-4">{t('auth.register.title')}</h1>
            <p className="text-gray-400">{t('auth.register.subtitle')}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">{t('auth.register.username_label')}</Label>
              <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="bg-gray-900/50 border-gray-700 text-white" />
            </div>
            <div>
              <Label htmlFor="email">{t('auth.register.email_label')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-gray-900/50 border-gray-700 text-white" />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.register.password_label')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-gray-900/50 border-gray-700 text-white" />
            </div>

            {/* CAPTCHA Section */}
            {/* CAPTCHA Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-center mb-4">
                <p className="text-white font-semibold">Security Verification</p>
              </div>
              <div className="flex justify-center">
                <Turnstile
                  key={captchaKey}
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

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('auth.register.submit_button')}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            {t('auth.register.has_account')}{' '}
            <Button variant="link" asChild className="p-0 h-auto text-red-400">
              <Link to="/login">{t('auth.register.login_link')}</Link>
            </Button>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
