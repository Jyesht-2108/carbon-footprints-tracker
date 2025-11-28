import { useState } from 'react'
import { Play, Plus, Trash2, Copy, Download, Zap, Sparkles, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { mlPredictionApi } from '../services/api'

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
  const [isAIPredicting, setIsAIPredicting] = useState(false)
  const [useAI, setUseAI] = useState(true)
  const [mlPredictions, setMlPredictions] = useState<any>(null)

  const baselineCO2 = 455.5 // kg CO₂ from current data

  const predictWithAI = async (scenario: Scenario) => {
    setIsAIPredicting(true)
    try {
      const { electricVehicles, routeOptimization, loadConsolidation, alternativeFuels } = scenario.changes
      
      // Prepare inputs for all 4 ML models based on scenario changes
      const baseDistance = 150
      const baseLoad = 5000
      const baseEnergy = 1200
      const baseRouteLength = 25
      
      // Adjust parameters based on scenario changes
      const evPercentage = electricVehicles / 100
      const routeOptPercentage = routeOptimization / 100
      const loadConsolidationPercentage = loadConsolidation / 100
      const altFuelPercentage = alternativeFuels / 100
      
      const predictions = await mlPredictionApi.predictAll({
        logistics: {
          distance_km: baseDistance * (1 - routeOptPercentage * 0.15),
          load_kg: baseLoad * (1 + loadConsolidationPercentage * 0.3),
          vehicle_type: evPercentage > 0.5 ? 'truck_electric' : 'truck_diesel',
          fuel_type: altFuelPercentage > 0.5 ? 'biodiesel' : 'diesel',
          avg_speed: 60 + (routeOptPercentage * 10),
          stop_events: Math.max(1, Math.floor(3 * (1 - routeOptPercentage * 0.5)))
        },
        factory: {
          energy_kwh: baseEnergy * (1 - electricVehicles / 200),
          shift_hours: 8,
          machine_runtime_hours: 7.5,
          furnace_usage: 500 * (1 - altFuelPercentage * 0.3),
          cooling_load: 200
        },
        warehouse: {
          temperature: 5,
          energy_kwh: 800 * (1 - electricVehicles / 200),
          refrigeration_load: 600,
          inventory_volume: 10000 * (1 + loadConsolidationPercentage * 0.2)
        },
        delivery: {
          route_length: baseRouteLength * (1 - routeOptPercentage * 0.2),
          vehicle_type: evPercentage > 0.5 ? 'electric_van' : 'van',
          traffic_score: Math.max(1, 7 - Math.floor(routeOptPercentage * 3)),
          delivery_count: Math.floor(15 * (1 + loadConsolidationPercentage * 0.3))
        }
      })
      
      setMlPredictions(predictions)
      
      // Calculate total CO2 from ML predictions
      let totalPredictedCO2 = 0
      let modelCount = 0
      
      if (predictions.logistics && !predictions.logistics.error) {
        totalPredictedCO2 += predictions.logistics.co2_kg
        modelCount++
      }
      if (predictions.factory && !predictions.factory.error) {
        totalPredictedCO2 += predictions.factory.co2_kg
        modelCount++
      }
      if (predictions.warehouse && !predictions.warehouse.error) {
        totalPredictedCO2 += predictions.warehouse.co2_kg
        modelCount++
      }
      if (predictions.delivery && !predictions.delivery.error) {
        totalPredictedCO2 += predictions.delivery.co2_kg
        modelCount++
      }
      
      const projectedCO2 = modelCount > 0 ? totalPredictedCO2 : baselineCO2
      const reduction = baselineCO2 - projectedCO2
      const reductionPercent = (reduction / baselineCO2) * 100
      
      // Calculate costs
      const cost = (electricVehicles * 500) + (routeOptimization * 100) + (loadConsolidation * 150) + (alternativeFuels * 200)
      const annualSavings = Math.abs(reduction) * 300
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
    } catch (error) {
      console.error('AI prediction failed:', error)
      // Fallback to simple calculation
      return calculateScenarioSimple(scenario)
    } finally {
      setIsAIPredicting(false)
    }
  }

  const calculateScenarioSimple = (scenario: Scenario): Scenario => {
    const { electricVehicles, routeOptimization, loadConsolidation, alternativeFuels } = scenario.changes
    
    // Calculate CO₂ reduction based on changes
    const evReduction = (electricVehicles / 100) * 0.60
    const routeReduction = (routeOptimization / 100) * 0.15
    const loadReduction = (loadConsolidation / 100) * 0.20
    const fuelReduction = (alternativeFuels / 100) * 0.30
    
    const totalReduction = evReduction + routeReduction + loadReduction + fuelReduction
    const projectedCO2 = baselineCO2 * (1 - totalReduction)
    const reduction = baselineCO2 - projectedCO2
    const reductionPercent = (reduction / baselineCO2) * 100
    
    const cost = (electricVehicles * 500) + (routeOptimization * 100) + (loadConsolidation * 150) + (alternativeFuels * 200)
    const annualSavings = reduction * 300
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

  const calculateScenario = (scenario: Scenario): Scenario => {
    if (useAI) {
      // Return current state, actual prediction happens on button click
      return scenario.result ? scenario : calculateScenarioSimple(scenario)
    }
    return calculateScenarioSimple(scenario)
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
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                      className="w-4 h-4 rounded border-white/30 bg-white/10 checked:bg-cyan-500 cursor-pointer"
                    />
                    <Sparkles size={14} className="text-cyan-400" />
                    <span className="font-medium">Use AI Models</span>
                  </label>
                  <button 
                    onClick={async () => {
                      if (useAI) {
                        const predicted = await predictWithAI(calculatedScenario)
                        setScenarios(scenarios.map(s =>
                          s.id === activeScenario ? predicted : s
                        ))
                      } else {
                        const calculated = calculateScenarioSimple(calculatedScenario)
                        setScenarios(scenarios.map(s =>
                          s.id === activeScenario ? calculated : s
                        ))
                      }
                    }}
                    disabled={isAIPredicting}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAIPredicting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Predicting with AI...
                      </>
                    ) : (
                      <>
                        {useAI ? <Sparkles size={16} /> : <Play size={16} />}
                        {useAI ? 'Predict with AI' : 'Run Simulation'}
                      </>
                    )}
                  </button>
                </div>
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

              {/* ML Predictions Display */}
              {mlPredictions && useAI && calculatedScenario.result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border-2 border-cyan-500/30"
                >
                  <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                    <Sparkles size={16} />
                    AI Model Predictions Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {mlPredictions.logistics && !mlPredictions.logistics.error && (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-white/60 text-xs mb-1">🚚 Logistics Model</div>
                        <div className="text-white font-bold text-lg">
                          {mlPredictions.logistics.co2_kg.toFixed(1)} kg CO₂
                        </div>
                        <div className="text-xs text-cyan-400 mt-1">
                          Confidence: {(mlPredictions.logistics.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                    {mlPredictions.factory && !mlPredictions.factory.error && (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-white/60 text-xs mb-1">🏭 Factory Model</div>
                        <div className="text-white font-bold text-lg">
                          {mlPredictions.factory.co2_kg.toFixed(1)} kg CO₂
                        </div>
                        <div className="text-xs text-cyan-400 mt-1">
                          Confidence: {(mlPredictions.factory.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                    {mlPredictions.warehouse && !mlPredictions.warehouse.error && (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-white/60 text-xs mb-1">📦 Warehouse Model</div>
                        <div className="text-white font-bold text-lg">
                          {mlPredictions.warehouse.co2_kg.toFixed(1)} kg CO₂
                        </div>
                        <div className="text-xs text-cyan-400 mt-1">
                          Confidence: {(mlPredictions.warehouse.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                    {mlPredictions.delivery && !mlPredictions.delivery.error && (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-white/60 text-xs mb-1">🚐 Delivery Model</div>
                        <div className="text-white font-bold text-lg">
                          {mlPredictions.delivery.co2_kg.toFixed(1)} kg CO₂
                        </div>
                        <div className="text-xs text-cyan-400 mt-1">
                          Confidence: {(mlPredictions.delivery.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-white/50 text-center">
                    ✨ Powered by 4 trained machine learning models
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
