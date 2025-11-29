import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Leaf, TrendingDown, Brain, Zap, Shield, BarChart3, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  const stats = [
    { value: '500+', label: 'Tons CO₂ Tracked', icon: Leaf },
    { value: '50+', label: 'Companies', icon: Shield },
    { value: '95%', label: 'Accuracy', icon: Brain },
    { value: '24/7', label: 'Monitoring', icon: Zap },
  ]

  const features = [
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Monitor emissions across your supply chain with live dashboards and instant insights.',
    },
    {
      icon: Brain,
      title: 'AI-Powered Predictions',
      description: '5 ML models working together to forecast emissions and detect anomalies automatically.',
    },
    {
      icon: TrendingDown,
      title: 'Smart Recommendations',
      description: 'Get actionable suggestions to reduce your carbon footprint with cost-benefit analysis.',
    },
    {
      icon: Zap,
      title: 'Instant Alerts',
      description: 'Real-time notifications when emissions spike above baseline thresholds.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Leaf className="text-cyan-400" size={32} />
            <span className="text-2xl font-bold text-white">Carbon Nexus</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-white hover:text-cyan-400 transition-colors font-medium"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-cyan-500/50"
            >
              Get Started
            </button>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Track Carbon.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Save the Planet.
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              AI-powered emissions intelligence for supply chains. Monitor, predict, and reduce your carbon footprint with real-time insights.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-bold text-lg border border-white/20"
              >
                View Demo
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <stat.icon className="text-cyan-400 mx-auto mb-3" size={32} />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Carbon Nexus?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Built for enterprises who take sustainability seriously
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all group"
            >
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-12 text-center backdrop-blur-sm"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to reduce your carbon footprint?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join leading companies in the fight against climate change
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 inline-flex items-center gap-2"
          >
            Get Started Now
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>© 2024 Carbon Nexus. Built for a sustainable future.</p>
        </div>
      </footer>
    </div>
  )
}
