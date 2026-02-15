import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Bot, MessageCircle, CreditCard, ArrowRight, Sparkles } from 'lucide-react';
import { Button, Card } from '../components/ui';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-dark border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold text-primary-500">
                OpenPaw
              </span>
            </div>
            <Link to="/dashboard">
              <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-600/50 to-accent-600/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 text-balance">
              Your AI Assistant,
              <br />
              <span className="text-primary-200">Ready in Minutes</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-balance">
              Deploy your personal AI agent powered by Claude—no DevOps, no infrastructure headaches. 
              Just chat via Telegram and let your AI companion get to work.
            </p>
            <Link to="/dashboard">
              <Button 
                size="lg" 
                variant="primary"
                className="bg-white text-secondary-600 hover:bg-gray-100 shadow-glow text-lg"
                icon={<Zap className="w-5 h-5" />}
              >
                Get Started Free
              </Button>
            </Link>
            <p className="mt-4 text-white/80 text-sm">
              ✓ Powered by Claude Sonnet 4.5  ✓ Runs on AWS  ✓ From $5/starter
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4 gradient-text">From Zero to AI in 5 Minutes</h2>
            <p className="text-gray-600 text-lg">No tutorials, no complex configuration—just instant AI</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <CreditCard className="w-12 h-12" />,
                title: '1. Sign Up in Seconds',
                description: 'Create your account—no credit card required to start exploring',
                color: 'text-green-500',
              },
              {
                icon: <Bot className="w-12 h-12" />,
                title: '2. Connect Your Bot',
                description: 'Create a Telegram bot with @BotFather, paste your token, and you\'re live',
                color: 'text-blue-500',
              },
              {
                icon: <MessageCircle className="w-12 h-12" />,
                title: '3. Start Chatting',
                description: 'Your AI agent is ready! Get help, automate tasks, or just have a conversation',
                color: 'text-purple-500',
              },
            ].map((step, index) => (
              <Card 
                key={index} 
                hover 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6 ${step.color}`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Thousands Choose OpenPaw</h2>
            <p className="text-gray-600 text-lg">Your AI companion, the easy way</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Quick Setup', desc: 'From zero to AI in 5 minutes—no technical skills needed' },
              { icon: '💰', title: 'Pay As You Go', desc: 'Auto-stops when idle. Credits never expire. No waste.' },
              { icon: '🤖', title: 'Claude Powered', desc: 'Anthropic\'s best AI running on reliable AWS infrastructure' },
              { icon: '🔒', title: 'Private & Secure', desc: 'Your agent, your data, your rules—completely isolated' },
              { icon: '📊', title: 'Usage Tracking', desc: 'See every conversation and cost in real-time' },
              { icon: '💬', title: 'Multi-Channel', desc: 'Telegram today, Discord & WhatsApp coming soon' },
            ].map((feature, index) => (
              <Card key={index} className="flex items-start space-x-4" hover>
                <div className="text-4xl">{feature.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Honest Pricing</h2>
            <p className="text-gray-600 text-lg">Pay for what you use—not what you don't. Credits never expire.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { 
                name: 'Starter', 
                price: '$5', 
                credits: '$10 credits', 
                bonus: 'First time 2x bonus!',
                desc: 'Perfect for trying OpenPaw',
                popular: false,
              },
              { 
                name: 'Builder', 
                price: '$15', 
                credits: '$15 credits',
                desc: 'Best for regular AI helpers',
                popular: true,
              },
              { 
                name: 'Pro', 
                price: '$50', 
                credits: '$50 credits',
                desc: 'For power users & teams',
                popular: false,
              },
            ].map((tier) => (
              <Card 
                key={tier.name}
                variant={tier.popular ? 'elevated' : 'default'}
                className={`text-center relative ${tier.popular ? 'ring-2 ring-primary-500 scale-105' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="text-5xl font-extrabold text-secondary-600 my-4">
                  {tier.price}
                </div>
                <div className="text-lg font-bold text-green-600 mb-2">
                  {tier.bonus || tier.credits}
                </div>
                <p className="text-gray-600 mb-6">{tier.desc}</p>
                
                <Link to="/dashboard">
                  <Button 
                    variant={tier.popular ? 'primary' : 'outline'} 
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              💳 Your agent auto-stops when idle · No subscriptions · Credits never expire
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready for Your AI Companion?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands building the future of AI automation—without the DevOps headaches
          </p>
          <Link to="/dashboard">
            <Button 
              size="lg" 
              className="bg-white text-secondary-600 hover:bg-gray-100 shadow-glow"
              icon={<Zap className="w-5 h-5" />}
            >
              Start Building Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white/70 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-bold text-primary-500">OpenPaw</span>
          </div>
          <p className="text-sm">© 2025 OpenPaw. Powered by Claude & AWS.</p>
          <p className="text-xs mt-2">Built with 🐾 for everyone who loves AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
