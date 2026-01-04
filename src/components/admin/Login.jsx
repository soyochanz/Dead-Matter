import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Turnstile } from '@marsidev/react-turnstile';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const turnstileRef = useRef();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validar CAPTCHA
    // if (!captchaToken) {
    //   toast({
    //     variant: "destructive",
    //     title: "CAPTCHA Required",
    //     description: "Please complete the CAPTCHA verification.",
    //   });
    //   return;
    // }

    setLoading(true);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        // Reset CAPTCHA on error
        setCaptchaToken('');
        turnstileRef.current?.reset();
        throw signInError;
      }
      toast({
        title: 'Success!',
        description: 'Logged in successfully.',
      });
    } catch (error) {
      // Error is handled by signIn context hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl shadow-red-500/10">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white">Admin Login</h1>
        <p className="text-gray-400 mt-2">Access your dashboard</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder:text-gray-400"
            required
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder:text-gray-400"
            required
          />
        </div>

        {/* CAPTCHA Section - Usando el mismo componente que en CreateGuide */}
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

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 py-3 text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </div>
  );
};

export default Login;