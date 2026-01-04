import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Turnstile } from '@marsidev/react-turnstile';

const RegisterPage = () => {
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

    // if (!captchaToken) {
    //     toast({ variant: 'destructive', title: 'CAPTCHA Required', description: 'Please complete the CAPTCHA.' });
    //     setLoading(false);
    //     return;
    // }

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

        toast({ title: 'Registration successful!', description: 'Please check your email to confirm your account.' });
        navigate('/');

      } else {
        throw new Error('User registration did not return a user object.');
      }

    } catch (error) {
      if (!error.message.includes('Sign up Failed')) {
        toast({ variant: 'destructive', title: 'Registration failed', description: error.message });
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
        <title>Register - Dead Matter Wiki</title>
      </Helmet>
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <div className="text-center mb-8">
            <UserPlus className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="text-3xl font-bold text-white mt-4">Create an Account</h1>
            <p className="text-gray-400">Join the community to create and share guides.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="bg-gray-900/50 border-gray-700 text-white" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-gray-900/50 border-gray-700 text-white" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-gray-900/50 border-gray-700 text-white" />
            </div>

            {/* CAPTCHA Section */}
            {/* <div className="bg-white/5 border border-white/10 rounded-xl p-6">
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
            </div> */}

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Register
            </Button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto text-red-400">
              <Link to="/login">Sign In</Link>
            </Button>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;