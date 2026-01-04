import React, { useState, useRef } from 'react';
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

    // if (!captchaToken) {
    //     toast({ variant: 'destructive', title: 'CAPTCHA Required', description: 'Please complete the CAPTCHA.' });
    //     setLoading(false);
    //     return;
    // }

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        throw new Error(signInError.message);
      }

      toast({ title: 'Login successful!', description: 'Welcome back.' });
      navigate(from, { replace: true });

    } catch (error) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
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
        <title>Login - Dead Matter Wiki</title>
      </Helmet>
      <div className="max-w-md mx-auto">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <div className="text-center mb-8">
            <LogIn className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="text-3xl font-bold text-white mt-4">Sign In</h1>
            <p className="text-gray-400">Access your account to contribute.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {/* CAPTCHA Section - Misma implementación que funciona */}
            {/* <div className="bg-white/5 border border-white/10 rounded-xl p-6">
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
                    appearance: 'always'
                  }}
                />
              </div>
              {captchaToken && (
                <div className="text-center mt-4">
                  <p className="text-green-400 text-sm font-semibold flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Verified
                  </p>
                </div>
              )}
            </div> */}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto text-red-400">
              <Link to="/register">Register</Link>
            </Button>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
