import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus } from 'lucide-react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: 'Account created successfully!',
            description: 'Please check your email to verify your account.',
          });
          setIsSignUp(false);
          setFullName('');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have been signed in successfully.',
          });
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Sign up to access the Vendor Discovery Platform' 
              : 'Sign in to your account to continue'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  disabled={loading}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : isSignUp ? (
                <UserPlus className="h-4 w-4 mr-2" />
              ) : (
                <LogIn className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setFullName('');
              }}
              disabled={loading}
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;