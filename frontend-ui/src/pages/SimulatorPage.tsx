import { useState } from 'react'
import { Play, Plus, Trash2, Copy, Download, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Scenario {
  id: string
  name: string
  changes: {
    electricVehicles: number
    routeOptimization: number
    loadConsolidation: number
    alternativeFuels: number
  }
  result?: {
    currentCO2: number
    projectedCO2: number
    reduction: number
    reductionPercent: number
    cost: number
    roi: number
  }
}

export default function SimulatorPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: '1',
      name: 'Baseline',
      changes: {
        electricVehicles: 0,
        routeOptimization: 0,
        loadConsolidation: 0,
        alternativeFuels: 0
      }
    }
  ])
  const [activeScenario, setActiveScenario] = useState('1')

  const baselineCO2 = 455.5 // kg CO₂ from current data

  const calculateScenario = (scenario: Scenario): Scenario => {
    const { electricVehicles, routeOptimization, loadConsolidation, alternativeFuels } = scenario.changes
    
    // Calculate CO₂ reduction based on changes
    const evReduction = (electricVehicles / 100) * 0.60 // EVs reduce 60% of emissions
    const routeReduction = (routeOptimization / 100) * 0.15 // Route optimization reduces 15%
    const loadReduction = (loadConsolidation / 100) * 0.20 // Load consolidation reduces 20%
    const fuelReduction = (alternativeFuels / 100) * 0.30 // Alternative fuels reduce 30%
    
    const totalReduction = evReduction + routeReduction + loadReduction + fuelReduction
    const projectedCO2 = baselineCO2 * (1 - totalReduction)
    const reduction = baselineCO2 - projectedCO2
    const reductionPercent = (reduction / baselineCO2) * 100
    
    // Calculate costs (simplified)
    const cost = (electricVehicles * 500) + (routeOptimization * 100) + (loadConsolidation * 150) + (alternativeFuels * 200)
    const annualSavings = reduction * 300 // $300 per kg CO₂ saved annually
    const roi = annualSavings > 0 ? (cost / annualSavings) * 12 : 0
    
    return {
      ...scenario,
      result: {
        currentCO2: baselineCO2,
        projectedCO2,
        reduction,
        reductionPercent,
        cost,
        roi
      }
    }
  }

  const addScenario = () => {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: `Scenario ${scenarios.length + 1}`,
      changes: {
        electricVehicles: 0,
        routeOptimization: 0,
        loadConsolidation: 0,
        alternativeFuels: 0
      }
    }
    setScenarios([...scenarios, newScenario])
    setActiveScenario(newScenario.id)
  }

  const deleteScenario = (id: string) => {
    if (scenarios.length === 1) return
    setScenarios(scenarios.filter(s => s.id !== id))
    if (activeScenario === id) {
      setActiveScenario(scenarios[0].id)
    }
  }

  const duplicateScenario = (scenario: Scenario) => {
    const newScenario: Scenario = {
      ...scenario,
      id: Date.now().toString(),
      name: `${scenario.name} (Copy)`
    }
    setScenarios([...scenarios, newScenario])
    setActiveScenario(newScenario.id)
  }

  const updateScenario = (id: string, changes: Partial<Scenario['changes']>) => {
    setScenarios(scenarios.map(s => 
      s.id === id ? { ...s, changes: { ...s.changes, ...changes } } : s
    ))
  }

  const activeScenarioData = scenarios.find(s => s.id === activeScenario)
  const calculatedScenario = activeScenarioData ? calculateScenario(activeScenarioData) : null

  // Prepare comparison data
  const comparisonData = scenarios.map(s => {
    const calc = calculateScenario(s)
    return {
      name: s.name,
      current: calc.result?.currentCO2 || 0,
      projected: calc.result?.projectedCO2 || 0,
      reduction: calc.result?.reduction || 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
            <Zap size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              What-If Simulator
            </h1>
            <p className="text-white/60 mt-1">Model different scenarios and predict CO₂ impact</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario List */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Scenarios</h3>
            <button
              onClick={addScenario}
              className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>

          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  activeScenario === scenario.id
                    ? 'bg-cyan-500/20 border-cyan-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
                onClick={() => setActiveScenario(scenario.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{scenario.name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        duplicateScenario(scenario)
                      }}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Copy size={14} className="text-white/60" />
                    </button>
                    {scenarios.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteScenario(scenario.id)
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario Editor */}
        <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl">
          {calculatedScenario && (
            <>
              <div className="flex items-center justify-between mb-6">
                <input
                  type="text"
                  value={calculatedScenario.name}
                  onChange={(e) => {
                    setScenarios(scenarios.map(s =>
                      s.id === activeScenario ? { ...s, name: e.target.value } : s
                    ))
                  }}
                  className="text-2xl font-bold text-white bg-transparent border-b-2 border-transparent hover:border-white/30 focus:border-cyan-500 focus:outline-none transition-colors"
                />
                <button 
                  onClick={() => {
                    // Recalculate and show results (already happening automatically)
                    // Add a toast notification for user feedback
                    const result = calculatedScenario.result
                    if (result) {
                      alert(`Simulation Complete!\n\nCO₂ Reduction: ${result.reduction.toFixed(1)} kg (-${result.reductionPercent.toFixed(1)}%)\nProjected CO₂: ${result.projectedCO2.toFixed(1)} kg\nCost: $${result.cost.toLocaleString()}\nROI: ${result.roi.toFixed(1)} months`)
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-500/50"
                >
                  <Play size={16} />
                  Run Simulation
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white font-semibold">Electric Vehicles</label>
                    <span className="text-cyan-400 font-bold">{calculatedScenario.changes.electricVehicles}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calculatedScenario.changes.electricVehicles}
                    onChange={(e) => updateScenario(activeScenario, { electricVehicles: parseInt(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${calculatedScenario.changes.electricVehicles}%, rgba(255,255,255,0.1) ${calculatedScenario.changes.electricVehicles}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                  <p className="text-xs text-white/50 mt-1">Percentage of fleet converted to electric vehicles</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white font-semibold">Route Optimization</label>
                    <span className="text-cyan-400 font-bold">{calculatedScenario.changes.routeOptimization}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calculatedScenario.changes.routeOptimization}
                    onChange={(e) => updateScenario(activeScenario, { routeOptimization: parseInt(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${calculatedScenario.changes.routeOptimization}%, rgba(255,255,255,0.1) ${calculatedScenario.changes.routeOptimization}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                  <p className="text-xs text-white/50 mt-1">Implementation level of route optimization software</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white font-semibold">Load Consolidation</label>
                    <span className="text-cyan-400 font-bold">{calculatedScenario.changes.loadConsolidation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calculatedScenario.changes.loadConsolidation}
                    onChange={(e) => updateScenario(activeScenario, { loadConsolidation: parseInt(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${calculatedScenario.changes.loadConsolidation}%, rgba(255,255,255,0.1) ${calculatedScenario.changes.loadConsolidation}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                  <p className="text-xs text-white/50 mt-1">Percentage of shipments consolidated</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white font-semibold">Alternative Fuels</label>
                    <span className="text-cyan-400 font-bold">{calculatedScenario.changes.alternativeFuels}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calculatedScenario.changes.alternativeFuels}
                    onChange={(e) => updateScenario(activeScenario, { alternativeFuels: parseInt(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${calculatedScenario.changes.alternativeFuels}%, rgba(255,255,255,0.1) ${calculatedScenario.changes.alternativeFuels}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                  <p className="text-xs text-white/50 mt-1">Adoption of biodiesel, hydrogen, or other alternatives</p>
                </div>
              </div>

              {/* Results */}
              {calculatedScenario.result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 grid grid-cols-2 gap-4"
                >
                  <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/30 rounded-xl">
                    <div className="text-emerald-400 text-sm font-semibold mb-1">CO₂ Reduction</div>
                    <div className="text-3xl font-bold text-white">{calculatedScenario.result.reduction.toFixed(1)} kg</div>
                    <div className="text-emerald-400 text-sm font-bold mt-1">
                      -{calculatedScenario.result.reductionPercent.toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 rounded-xl">
                    <div className="text-cyan-400 text-sm font-semibold mb-1">Projected CO₂</div>
                    <div className="text-3xl font-bold text-white">{calculatedScenario.result.projectedCO2.toFixed(1)} kg</div>
                    <div className="text-white/60 text-sm mt-1">vs {calculatedScenario.result.currentCO2.toFixed(1)} kg current</div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 rounded-xl">
                    <div className="text-amber-400 text-sm font-semibold mb-1">Implementation Cost</div>
                    <div className="text-3xl font-bold text-white">${calculatedScenario.result.cost.toLocaleString()}</div>
                    <div className="text-white/60 text-sm mt-1">One-time investment</div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-xl">
                    <div className="text-purple-400 text-sm font-semibold mb-1">ROI Timeline</div>
                    <div className="text-3xl font-bold text-white">{calculatedScenario.result.roi.toFixed(1)} mo</div>
                    <div className="text-white/60 text-sm mt-1">Payback period</div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Comparison Chart */}
      {scenarios.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Scenario Comparison</h3>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all flex items-center gap-2">
              <Download size={16} />
              Export Report
            </button>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)' }} label={{ value: 'CO₂ (kg)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    border: '2px solid rgba(6, 182, 212, 0.5)',
                    borderRadius: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="current" fill="#ef4444" name="Current CO₂" />
                <Bar dataKey="projected" fill="#10b981" name="Projected CO₂" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  )
}
