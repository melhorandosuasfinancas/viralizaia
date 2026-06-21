"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  MessageCircle,
  Sparkles,
  Wand2,
  Loader2,
  Play,
  Pause,
  RotateCw,
  History,
  AlertCircle,
  Palette,
  ImageIcon,
  Sun,
  User,
  Monitor,
  Cpu,
  RatioIcon as AspectRatio,
  Film,
  CuboidIcon as Cube,
  ArrowLeft,
  Clock,
  Search,
} from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type GenerationMode = "image" | "video" | "avatar"

interface GenerationSettings {
  style: string
  backgroundColor: string
  lighting: string
  pose: string
  aspectRatio: string
  aiModel: string
  resolution: string
  prompt: string
  negativePrompt: string
  seed?: number
  steps?: number
}

interface HistoryItem {
  id: string
  type: GenerationMode
  url: string
  prompt: string
  timestamp: Date
}

const PLACEHOLDER_THUMB =
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80&auto=format&fit=crop"

function AIMultiModalGeneration() {
  const [mode, setMode] = useState<GenerationMode>("image")
  const [showForm, setShowForm] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  const [generatedItems, setGeneratedItems] = useState<HistoryItem[]>([
    {
      id: "1",
      type: "image",
      url: PLACEHOLDER_THUMB,
      prompt: "Corte viral de podcast com legendas TikTok",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "2",
      type: "video",
      url: PLACEHOLDER_THUMB,
      prompt: "Reels 9:16 com momentos de alta retenção",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
  ])

  const [settings, setSettings] = useState<GenerationSettings>({
    style: "tiktok",
    backgroundColor: "studio",
    lighting: "studio",
    pose: "headshot",
    aspectRatio: "9:16",
    aiModel: "viraliza-ia",
    resolution: "1080x1920",
    prompt: "",
    negativePrompt: "blurry, low quality, distorted features",
  })

  const placeholderPrompts: Record<GenerationMode, string> = {
    image: "Cole o link do YouTube para gerar a thumbnail",
    video: "Cole o link do YouTube para gerar os cortes virais",
    avatar: "Avatar 3D para overlay nos cortes",
  }

  const loadingTexts: Record<GenerationMode, string[]> = {
    image: ["Analisando momentos virais...", "Aplicando legendas TikTok...", "Renderizando thumbnail..."],
    video: ["Identificando picos virais...", "Cortando os trechos top...", "Gerando legendas animadas..."],
    avatar: ["Criando malha 3D...", "Aplicando texturas...", "Finalizando avatar..."],
  }

  const aiModels: Record<GenerationMode, { value: string; label: string }[]> = {
    image: [
      { value: "viraliza-ia", label: "Viraliza IA" },
      { value: "stable-diffusion-xl", label: "Stable Diffusion XL" },
      { value: "midjourney-v5", label: "Midjourney v5" },
    ],
    video: [
      { value: "viraliza-cortes", label: "Viraliza Cortes IA" },
      { value: "gen-2", label: "Runway Gen-2" },
      { value: "pika-labs", label: "Pika Labs" },
    ],
    avatar: [
      { value: "viraliza-avatar", label: "Viraliza Avatar" },
      { value: "dreamshaper-3d", label: "DreamShaper 3D" },
    ],
  }

  const resolutions: Record<GenerationMode, { value: string; label: string }[]> = {
    image: [
      { value: "1080x1920", label: "1080×1920 (TikTok/Reels)" },
      { value: "1080x1080", label: "1080×1080 (Feed)" },
      { value: "1920x1080", label: "1920×1080 (YouTube)" },
    ],
    video: [
      { value: "720x1280", label: "720×1280 (HD vertical)" },
      { value: "1080x1920", label: "1080×1920 (Full HD)" },
      { value: "1920x1080", label: "1920×1080 (Horizontal)" },
    ],
    avatar: [
      { value: "512x512", label: "512×512" },
      { value: "1024x1024", label: "1024×1024" },
    ],
  }

  useEffect(() => {
    if (mode === "image") {
      setPromptSuggestions([
        "Thumbnail YouTube com texto chamativo",
        "Capa de podcast com cores vibrantes",
        "Print TikTok estilo viral",
      ])
    } else if (mode === "video") {
      setPromptSuggestions([
        "Cortes de 60s com legendas TikTok",
        "Reels de momentos engraçados",
        "YouTube Shorts com hook forte",
      ])
    } else {
      setPromptSuggestions([
        "Avatar 3D profissional",
        "Mascote animado estilo cartoon",
        "Personagem com visual viral",
      ])
    }
  }, [mode])

  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      return
    }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + (mode === "image" ? 1.5 : mode === "video" ? 0.8 : 0.5)
      })
    }, 30)
    return () => clearInterval(interval)
  }, [isLoading, mode])

  useEffect(() => {
    if (!isLoading) return
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % loadingTexts[mode].length)
    }, 1500)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowForm(false)
    setIsLoading(true)
    setError(null)
    try {
      const loadingTime = mode === "image" ? 3000 : mode === "video" ? 5000 : 7000
      await new Promise((r) => setTimeout(r, loadingTime))
      setGeneratedItems((prev) => [
        {
          id: Date.now().toString(),
          type: mode,
          url: PLACEHOLDER_THUMB,
          prompt: settings.prompt || "Conteúdo gerado pela IA",
          timestamp: new Date(),
        },
        ...prev,
      ])
    } catch {
      setError(`Falha ao gerar ${mode}. Tente novamente.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToSettings = () => {
    setShowForm(true)
    setShowHistory(false)
    setError(null)
  }
  const handleModeChange = (newMode: GenerationMode) => {
    setMode(newMode)
    setShowForm(true)
    setShowHistory(false)
    setError(null)
  }
  const handleViewHistory = () => {
    setShowForm(false)
    setShowHistory(true)
  }
  const handleSelectHistoryItem = (id: string) => {
    const item = generatedItems.find((i) => i.id === id)
    if (item) {
      setMode(item.type)
      setShowHistory(false)
      setShowForm(false)
    }
  }
  const applyPromptSuggestion = (suggestion: string) =>
    setSettings({ ...settings, prompt: suggestion })

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    if (diffMins < 1) return "Agora"
    if (diffMins < 60) return `${diffMins}m atrás`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h atrás`
    return date.toLocaleDateString()
  }

  const filteredItems = generatedItems.filter((item) =>
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderHeader = () => (
    <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Viraliza IA — Gerador</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Transforme vídeos em cortes virais</p>
        </div>
      </div>
      <button
        onClick={handleViewHistory}
        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <History className="w-4 h-4 text-zinc-500" />
      </button>
    </div>
  )

  const renderError = () =>
    error && (
      <div className="m-4 px-4 py-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-xl">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <p>{error}</p>
      </div>
    )

  const renderSettings = () => (
    <div className="space-y-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-zinc-500" />
          <span className="text-sm text-zinc-500">Modelo IA</span>
        </div>
        <Select value={settings.aiModel} onValueChange={(v) => setSettings({ ...settings, aiModel: v })}>
          <SelectTrigger className="w-[160px] h-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {aiModels[mode].map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-zinc-500" />
          <span className="text-sm text-zinc-500">Resolução</span>
        </div>
        <Select value={settings.resolution} onValueChange={(v) => setSettings({ ...settings, resolution: v })}>
          <SelectTrigger className="w-[160px] h-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {resolutions[mode].map((res) => (
              <SelectItem key={res.value} value={res.value}>
                {res.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-zinc-500" />
          <span className="text-sm text-zinc-500">Estilo de legenda</span>
        </div>
        <Select value={settings.style} onValueChange={(v) => setSettings({ ...settings, style: v })}>
          <SelectTrigger className="w-[160px] h-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="hormozi">Hormozi</SelectItem>
            <SelectItem value="dark">Dark Box</SelectItem>
            <SelectItem value="clean">Clean</SelectItem>
            <SelectItem value="neon">Neon</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AspectRatio className="w-4 h-4 text-zinc-500" />
          <span className="text-sm text-zinc-500">Proporção</span>
        </div>
        <Select value={settings.aspectRatio} onValueChange={(v) => setSettings({ ...settings, aspectRatio: v })}>
          <SelectTrigger className="w-[160px] h-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="9:16">9:16 (TikTok/Reels)</SelectItem>
            <SelectItem value="1:1">1:1 (Feed)</SelectItem>
            <SelectItem value="16:9">16:9 (YouTube)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1 p-4 justify-between">
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-500">Link do vídeo</span>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Wand2 className="w-3.5 h-3.5 text-zinc-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2">
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-zinc-500">Sugestões</h4>
                  <div className="space-y-1">
                    {promptSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applyPromptSuggestion(s)}
                        className="w-full text-left p-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Textarea
            value={settings.prompt}
            onChange={(e) => setSettings({ ...settings, prompt: e.target.value })}
            placeholder={placeholderPrompts[mode]}
            className="w-full min-h-[80px] bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 rounded-xl"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="advanced-mode" checked={advancedMode} onCheckedChange={setAdvancedMode} />
          <Label htmlFor="advanced-mode" className="text-xs text-zinc-500">
            Modo avançado
          </Label>
        </div>

        {advancedMode && (
          <div className="space-y-3 p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
            <div className="space-y-2">
              <label className="text-xs text-zinc-500">Prompt negativo</label>
              <Textarea
                value={settings.negativePrompt}
                onChange={(e) => setSettings({ ...settings, negativePrompt: e.target.value })}
                placeholder="O que evitar"
                className="w-full min-h-[60px] bg-white dark:bg-zinc-800 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-500">Seed</label>
                <span className="text-xs text-zinc-700 dark:text-zinc-300">{settings.seed || 0}</span>
              </div>
              <Slider
                defaultValue={[settings.seed || 0]}
                max={1000000}
                step={1}
                onValueChange={(v) => setSettings({ ...settings, seed: v[0] })}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-500">Steps</label>
                <span className="text-xs text-zinc-700 dark:text-zinc-300">{settings.steps || 30}</span>
              </div>
              <Slider
                defaultValue={[settings.steps || 30]}
                min={10}
                max={150}
                step={1}
                onValueChange={(v) => setSettings({ ...settings, steps: v[0] })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {renderSettings()}
        <button
          type="submit"
          className="w-full h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Gerar {mode === "image" ? "Thumbnail" : mode === "video" ? "Cortes" : "Avatar"}
        </button>
      </div>
    </form>
  )

  const renderGallery = () => {
    const items = generatedItems.slice(0, 3)
    if (items.length === 0) return null
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-zinc-500">Gerações recentes</h4>
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.prompt} className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                <div className="flex items-center gap-1">
                  {item.type === "image" && <ImageIcon className="w-3 h-3 text-white" />}
                  {item.type === "video" && <Film className="w-3 h-3 text-white" />}
                  {item.type === "avatar" && <Cube className="w-3 h-3 text-white" />}
                  <span className="text-[10px] text-white truncate">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderPreview = () => (
    <div className="p-4">
      <div className="rounded-xl mb-4 flex items-center justify-center">
        {isLoading ? (
          <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <div className="relative w-16 h-16">
                <Loader2 className="w-full h-full animate-spin text-fuchsia-500" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {loadingTexts[mode][currentTextIndex]}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {mode === "image" ? "Em 10-15s" : mode === "video" ? "Em 20-30s" : "Em 30-45s"}
                </p>
              </div>
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-all duration-300 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="relative w-full rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generatedItems[0]?.url || PLACEHOLDER_THUMB}
                alt={`Gerado ${mode}`}
                className={`rounded-xl object-cover w-full h-full ${isRotating ? "animate-spin" : ""}`}
              />
              {mode !== "image" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-1" />
                    )}
                  </button>
                </div>
              )}
              {mode === "avatar" && (
                <button
                  onClick={() => setIsRotating(!isRotating)}
                  className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                >
                  <RotateCw className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {!isLoading && (
        <div className="space-y-4">
          <div className="p-3 space-y-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Qualidade</span>
              <span className="text-zinc-900 dark:text-zinc-100">{settings.resolution}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Modelo</span>
              <span className="text-zinc-900 dark:text-zinc-100">{settings.aiModel}</span>
            </div>
          </div>
          {renderGallery()}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleBackToSettings}
              className="w-full h-9 flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-medium rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Voltar
            </button>
            <button
              type="button"
              className="w-full h-9 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Baixar
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderHistory = () => (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={handleBackToSettings}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500" />
        </button>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Histórico</h3>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          type="text"
          placeholder="Buscar por prompt..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-zinc-100 dark:bg-zinc-800 border-none text-sm"
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Clock className="w-8 h-8 text-zinc-400 mb-2" />
            <p className="text-sm text-zinc-500">Nenhuma geração encontrada</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectHistoryItem(item.id)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.prompt} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-900 dark:text-zinc-100 truncate">{item.prompt}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-zinc-500">{formatDate(item.timestamp)}</span>
                  <span className="text-[10px] text-zinc-400">•</span>
                  <span className="text-[10px] text-zinc-500 capitalize">{item.type}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  return (
    <div className="group relative overflow-hidden w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] min-h-[600px] flex flex-col justify-between gap-2">
      {renderHeader()}
      <Tabs value={mode} onValueChange={(v) => handleModeChange(v as GenerationMode)} className="w-full px-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>Thumb</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            <span>Cortes</span>
          </TabsTrigger>
          <TabsTrigger value="avatar" className="flex items-center gap-2">
            <Cube className="w-4 h-4" />
            <span>Avatar</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex-1 overflow-hidden flex flex-col">
        {renderError()}
        {showHistory ? renderHistory() : showForm ? renderForm() : renderPreview()}
      </div>
    </div>
  )
}

export { AIMultiModalGeneration }
