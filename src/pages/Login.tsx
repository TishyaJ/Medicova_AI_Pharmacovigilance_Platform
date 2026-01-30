import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import medicovaLogo from '@/assets/medicova-logo.png';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginTab from '@/components/auth/LoginTab';
import SignupWizard from '@/components/auth/SignupWizard';

const Login = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* Language Switcher */}
      <div className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="medical-card p-8 shadow-xl transition-all duration-300 animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex flex-col items-center">
              <img
                src={medicovaLogo}
                alt="MEDICOVA - AI-Powered Pharmacovigilance Platform"
                className="mb-4 h-20 w-auto object-contain"
              />
              <h1 className="sr-only">MEDICOVA Authentication</h1>
              <p className="text-center text-sm text-muted-foreground font-medium">
                Your Intelligent Pharmacovigilance Platform
              </p>
            </div>

            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
              aria-label="Authentication options"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8 h-14 p-1.5 bg-muted" role="tablist">
                <TabsTrigger
                  value="login"
                  aria-label="Login to existing account"
                  className="text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  aria-label="Create new account"
                  className="text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" role="tabpanel" aria-labelledby="login-tab">
                <LoginTab />
              </TabsContent>

              <TabsContent value="signup" role="tabpanel" aria-labelledby="signup-tab">
                <SignupWizard />
              </TabsContent>
            </Tabs>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Medicova © 2025. Secure & Private.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
