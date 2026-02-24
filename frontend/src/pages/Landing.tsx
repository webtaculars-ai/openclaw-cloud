import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Bot, Globe, Clock, Shield, DollarSign, ArrowRight, Sparkles, CheckCircle, Plane, Package, Calendar, TrendingUp, Bell, Check, X } from 'lucide-react';
import { Button, Card } from '../components/ui';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                OpenPaw
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="hidden sm:inline-block text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link to="/dashboard">
                <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
              <span className="text-blue-600 font-semibold text-sm">🚀 500+ Agents Running · 50,000+ Tasks Automated</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 text-gray-900 leading-tight">
              AI That <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Acts</span>,
              <br />
              Not Just Chats
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              While ChatGPT talks about booking flights, <strong>OpenPaw actually books them</strong>. 
              Real browser automation. Real tasks completed. Your AI, everywhere.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg px-8"
                  icon={<Zap className="w-5 h-5" />}
                >
                  Start Your Agent (Free $20 Credits)
                </Button>
              </Link>
              <a href="#demo">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-gray-400 text-lg px-8"
                >
                  Watch 2-Min Demo
                </Button>
              </a>
            </div>

            <p className="text-sm text-gray-500 flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" /> No credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" /> $20 free credits
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" /> Cancel anytime
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">AI Can Talk. But Can It <span className="text-blue-600">Do</span>?</h2>
            <p className="text-xl text-gray-600">Most AI assistants stop at suggestions. OpenPaw gets things done.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                emoji: '💬',
                problem: 'ChatGPT describes how to book a flight',
                reality: 'You: Still have to do it manually',
                color: 'bg-red-50 border-red-200'
              },
              {
                emoji: '📱',
                problem: 'Apps are scattered across platforms',
                reality: 'You: Constantly switching between tools',
                color: 'bg-orange-50 border-orange-200'
              },
              {
                emoji: '🔁',
                problem: 'Repetitive tasks eat your time',
                reality: 'You: Same questions, same actions, every day',
                color: 'bg-yellow-50 border-yellow-200'
              }
            ].map((item, i) => (
              <div key={i} className={`p-6 rounded-xl border-2 ${item.color}`}>
                <div className="text-4xl mb-4">{item.emoji}</div>
                <p className="font-semibold text-gray-900 mb-2">{item.problem}</p>
                <p className="text-gray-600 text-sm italic">{item.reality}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg">
              → What if your AI could actually complete tasks for you?
            </div>
          </div>
        </div>
      </section>

      {/* Features as Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Meet Your AI That Actually Works</h2>
          </div>

          {/* Feature 1: Browser Automation */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold mb-4">
                ✨ Real Browser Automation
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">Book Flights While You Sleep</h3>
              <p className="text-lg text-gray-600 mb-6">
                Not just AI that suggests flights—AI that <strong>opens browsers, fills forms, completes checkouts</strong>, and sends you screenshots. 
                From research to booking, automatically.
              </p>
              <div className="space-y-3">
                {['Flight booking', 'Package tracking', 'Form filling', 'Price monitoring'].map((use, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{use}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 lg:p-12 shadow-xl">
              <div className="aspect-video bg-white rounded-lg shadow-inner flex items-center justify-center">
                <Globe className="w-20 h-20 text-blue-500 animate-pulse" />
              </div>
              <p className="text-center mt-4 text-sm text-gray-600">Browser automation in action →</p>
            </div>
          </div>

          {/* Feature 2: Multi-Channel */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20 lg:flex-row-reverse">
            <div className="lg:order-2">
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-4">
                📱 Multi-Channel
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">One AI, All Your Apps</h3>
              <p className="text-lg text-gray-600 mb-6">
                <strong>Telegram. WhatsApp. Discord.</strong> Your AI works where you already are. 
                Start a conversation on Telegram, continue on WhatsApp. Same brain, everywhere.
              </p>
              <div className="space-y-3">
                {['Switch apps seamlessly', 'Context remembered', 'No platform lock-in', 'Work from anywhere'].map((use, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">{use}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:order-1 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 lg:p-12 shadow-xl">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-md flex items-center gap-3">
                  <Bot className="w-8 h-8 text-blue-500" />
                  <span className="font-semibold">Telegram</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md flex items-center gap-3">
                  <Bot className="w-8 h-8 text-green-500" />
                  <span className="font-semibold">WhatsApp</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md flex items-center gap-3">
                  <Bot className="w-8 h-8 text-purple-500" />
                  <span className="font-semibold">Discord</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Automation */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
                ⚡ Set & Forget
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">Daily Briefings on Autopilot</h3>
              <p className="text-lg text-gray-600 mb-6">
                Schedule your AI to check stock prices at 9am, send daily summaries at 6pm, or monitor news 24/7. 
                Your personal automation system that never sleeps.
              </p>
              <div className="space-y-3">
                {['Daily standup reports', 'Stock alerts', 'Morning news', 'Weekly summaries'].map((use, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">{use}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-8 lg:p-12 shadow-xl">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Daily Standup</span>
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600">Every day at 9:00 AM</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Stock Check</span>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600">Every hour</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">News Alerts</span>
                    <Bell className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-sm text-gray-600">When keywords match</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Not Another Chatbot</h2>
            <p className="text-xl text-gray-600">See how OpenPaw compares to ChatGPT</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left font-semibold text-gray-900">Feature</th>
                  <th className="p-4 text-center font-semibold text-gray-600">ChatGPT</th>
                  <th className="p-4 text-center font-semibold text-blue-600">OpenPaw</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'AI Conversations', chatgpt: true, openpaw: true },
                  { feature: 'Browse the web', chatgpt: 'limited', openpaw: true },
                  { feature: 'Complete tasks', chatgpt: false, openpaw: true },
                  { feature: 'Multi-platform', chatgpt: false, openpaw: true },
                  { feature: 'Scheduled automation', chatgpt: false, openpaw: true },
                  { feature: 'Your data stays yours', chatgpt: 'limited', openpaw: true },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="p-4 text-gray-900 font-medium">{row.feature}</td>
                    <td className="p-4 text-center">
                      {row.chatgpt === true && <Check className="w-6 h-6 text-green-500 mx-auto" />}
                      {row.chatgpt === false && <X className="w-6 h-6 text-red-400 mx-auto" />}
                      {row.chatgpt === 'limited' && <span className="text-yellow-600">⚠️ Limited</span>}
                    </td>
                    <td className="p-4 text-center">
                      {row.openpaw && <Check className="w-6 h-6 text-blue-600 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">What Can You Build?</h2>
            <p className="text-xl text-gray-600">Real examples from real users</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Globe className="w-8 h-8" />,
                title: 'Personal Research Assistant',
                uses: ['Track competitor prices', 'Monitor news keywords', 'Scrape data automatically'],
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: <Plane className="w-8 h-8" />,
                title: 'Travel Concierge',
                uses: ['Find cheapest flights', 'Track deliveries', 'Monitor hotel prices'],
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: 'Daily Briefing Bot',
                uses: ['Morning news summary', 'Weather + calendar', 'Stock updates'],
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: <Package className="w-8 h-8" />,
                title: 'Business Automation',
                uses: ['Fill expense reports', 'Schedule social posts', 'Monitor uptime'],
                color: 'from-green-500 to-teal-500'
              },
              {
                icon: <Bot className="w-8 h-8" />,
                title: 'Learning Companion',
                uses: ['Daily study reminders', 'Flashcard sessions', 'Progress tracking'],
                color: 'from-indigo-500 to-purple-500'
              },
              {
                icon: <Bell className="w-8 h-8" />,
                title: 'Personal Assistant',
                uses: ['Reply reminders', 'Summarize articles', 'Multi-language translation'],
                color: 'from-pink-500 to-rose-500'
              }
            ].map((useCase, i) => (
              <Card key={i} hover className="p-6">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${useCase.color} text-white mb-4`}>
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{useCase.title}</h3>
                <ul className="space-y-2">
                  {useCase.uses.map((use, j) => (
                    <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Control */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Your AI. Your Data. Your Control.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-12 h-12" />,
                title: '🔒 Privacy First',
                points: ['Conversations stay yours', 'No model training on your data', 'End-to-end encryption'],
                color: 'text-green-600'
              },
              {
                icon: <DollarSign className="w-12 h-12" />,
                title: '💰 Fair Pricing',
                points: ['Pay only for usage', 'No subscriptions', 'Credits never expire'],
                color: 'text-blue-600'
              },
              {
                icon: <Bot className="w-12 h-12" />,
                title: '⚙️ Full Control',
                points: ['Your own infrastructure', 'Stop/start anytime', 'Export your data'],
                color: 'text-purple-600'
              }
            ].map((pillar, i) => (
              <div key={i} className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6 ${pillar.color}`}>
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{pillar.title}</h3>
                <ul className="space-y-2 text-gray-600">
                  {pillar.points.map((point, j) => (
                    <li key={j}>✓ {point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Start Free, Scale as You Need</h2>
            <p className="text-xl text-gray-600">No subscriptions. No lock-in. Pay only for usage.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$10',
                credits: '$20 in credits',
                bonus: '100% bonus',
                features: ['~500 AI conversations', '~50 automation tasks', 'All features included', 'Perfect for trying out'],
                popular: false
              },
              {
                name: 'Builder',
                price: '$25',
                credits: '$25 in credits',
                bonus: null,
                features: ['~600 conversations', '~60 automation tasks', 'All features included', 'Most popular'],
                popular: true
              },
              {
                name: 'Pro',
                price: '$75',
                credits: '$75 in credits',
                bonus: null,
                features: ['~1,800 conversations', '~180 automation tasks', 'All features included', 'For power users'],
                popular: false
              }
            ].map((tier, i) => (
              <Card key={i} hover className={`p-8 relative ${tier.popular ? 'border-2 border-blue-500 shadow-xl' : ''}`}>
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  {tier.bonus && <span className="ml-2 text-sm text-green-600 font-semibold">{tier.bonus}</span>}
                </div>
                <p className="text-gray-600 mb-6">{tier.credits}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/dashboard">
                  <Button 
                    className={`w-full ${tier.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    Get Started
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          <p className="text-center text-gray-600 mt-8">Credits never expire • No subscriptions • Cancel anytime</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Stop Chatting and Start Acting?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join 500+ users who've automated 50,000+ tasks with their personal AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8"
                icon={<Zap className="w-5 h-5" />}
              >
                Start Your Free Agent
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-blue-100 text-sm">
            No credit card required • $20 free credits • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-bold text-white">OpenPaw</span>
              </div>
              <p className="text-sm">AI that acts, not just chats.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/dashboard" className="hover:text-white">Get Started</Link></li>
                <li><Link to="/dashboard" className="hover:text-white">Pricing</Link></li>
                <li><a href="#demo" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/refund-policy" className="hover:text-white">Refund Policy</Link></li>
                <li><a href="mailto:support@openpaw.co" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@openpaw.co" className="hover:text-white">Email Support</a></li>
                <li><a href="https://github.com/openclaw/openclaw" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 OpenPaw. All rights reserved. Powered by OpenClaw & AWS Bedrock.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
