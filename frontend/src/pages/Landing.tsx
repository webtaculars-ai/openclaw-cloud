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
                OpenPaw Cloud
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
              Your AI Agent,
              <br />
              <span className="text-primary-200">Running in Minutes</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-balance">
              Deploy your own OpenPaw agent to AWS with zero infrastructure hassle.
              Chat, automate, and scale with ease.
            </p>
            <Link to="/dashboard">
              <Button 
                size="lg" 
                variant="primary"
                className="bg-white text-secondary-600 hover:bg-gray-100 shadow-glow text-lg"
                icon={<Zap className="w-5 h-5" />}
              >
                Start for $5
              </Button>
            </Link>
            <p className="mt-4 text-white/80 text-sm">
              Get $10 in credits with our 2x welcome bonus 🎉
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4 gradient-text">How It Works</h2>
            <p className="text-gray-600 text-lg">Three simple steps to get your AI agent live</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <CreditCard className="w-12 h-12" />,
                title: '1. Sign Up & Pay $5',
                description: 'Get $10 in credits (2x welcome bonus) to start your journey',
                color: 'text-green-500',
              },
              {
                icon: <Bot className="w-12 h-12" />,
                title: '2. Connect Telegram',
                description: 'Create a bot with @BotFather, paste your token, and configure',
                color: 'text-blue-500',
              },
              {
                icon: <MessageCircle className="w-12 h-12" />,
                title: '3. Start Chatting',
                description: 'Your agent is live! Pay only for what you use with AWS Bedrock',
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
            <h2 className="text-4xl font-bold mb-4">Why OpenPaw Cloud?</h2>
            <p className="text-gray-600 text-lg">Everything you need to run your AI agent at scale</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Instant Setup', desc: 'Live in under 5 minutes' },
              { icon: '💰', title: 'Pay As You Go', desc: 'No subscriptions, credits never expire' },
              { icon: '🚀', title: 'AWS Powered', desc: 'Enterprise-grade infrastructure' },
              { icon: '🔒', title: 'Secure by Default', desc: 'Your data stays private' },
              { icon: '📊', title: 'Usage Analytics', desc: 'Track every conversation & cost' },
              { icon: '🎯', title: 'Multiple Channels', desc: 'Telegram, Discord & more coming' },
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
            <h2 className="text-4xl font-bold mb-4">Simple, Fair Pricing</h2>
            <p className="text-gray-600 text-lg">No hidden fees. No subscriptions. Just straightforward credits.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { 
                name: 'Starter', 
                price: '$5', 
                credits: '$10 credits', 
                bonus: 'First time 2x bonus!',
                desc: 'Perfect for trying it out',
                popular: false,
              },
              { 
                name: 'Builder', 
                price: '$15', 
                credits: '$15 credits',
                desc: 'Best for regular use',
                popular: true,
              },
              { 
                name: 'Pro', 
                price: '$50', 
                credits: '$50 credits',
                desc: 'For power users',
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
              💳 Pay-as-you-go model usage · No subscriptions · Credits never expire
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Deploy Your Agent?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join developers building the future of AI automation
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
            <span className="text-xl font-bold text-primary-500">OpenPaw Cloud</span>
          </div>
          <p className="text-sm">© 2025 OpenPaw Cloud. Powered by AWS + Bedrock.</p>
          <p className="text-xs mt-2">Built with ❤️ for the OpenClaw community</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
