"use client"

import { useState } from 'react'
import { ArrowLeft, Save, User, Building, Home, Factory, Wrench, Calendar, DollarSign, FileText, Users, Phone, Mail, MapPin, CreditCard, Settings, CheckCircle, Circle, Star, Plus, Trash2, Edit, ChevronDown, ChevronUp, Award, Sparkles, Target, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from 'next/navigation'

// Interfaces (copiadas do arquivo principal)
interface TaskTemplate {
  id: string
  name: string
  description: string
  estimatedDays: number
  priority: 'low' | 'medium' | 'high'
  dependencies: string[]
  normativeRequirements?: string
  technicalSteps?: string[]
  points?: number
}

interface StageTemplate {
  id: string
  name: string
  description: string
  tasks: TaskTemplate[]
  isContracted?: boolean
}

interface Client {
  id: string
  fullName: string
  phone: string
  email: string
  personalAddress: {
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  workAddress?: {
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    isDifferent: boolean
  }
  document: string
  birthDate: string
  profession: string
  maritalStatus: string
  additionalContacts: {
    alternativePhone: string
    emergencyContact: string
    emergencyPhone: string
  }
  observations: string
  bankingInfo: {
    bank: string
    agency: string
    account: string
    accountType: string
  }
  projectResponsibles: string[]
  createdAt: string
}

// Templates de etapas (copiados do arquivo principal)
const defaultStageTemplates: StageTemplate[] = [
  {
    id: 'medicao',
    name: 'Medição',
    description: 'Etapa de levantamento e medição do local',
    isContracted: false,
    tasks: [
      {
        id: 'med_01',
        name: 'Medição no local',
        description: 'Realizar medição completa do terreno e construção existente',
        estimatedDays: 2,
        priority: 'high',
        dependencies: [],
        normativeRequirements: 'NBR 13133 - Execução de levantamento topográfico',
        technicalSteps: ['Preparação de equipamentos', 'Medição de campo', 'Registro fotográfico'],
        points: 50
      },
      {
        id: 'med_02',
        name: 'Desenho da medição',
        description: 'Elaboração do desenho técnico baseado nas medições realizadas',
        estimatedDays: 3,
        priority: 'high',
        dependencies: ['med_01'],
        technicalSteps: ['Processamento dos dados', 'Desenho técnico', 'Revisão e validação'],
        points: 75
      },
      {
        id: 'med_03',
        name: 'Análise do terreno',
        description: 'Avaliação das condições do terreno e restrições',
        estimatedDays: 1,
        priority: 'medium',
        dependencies: ['med_01'],
        technicalSteps: ['Análise topográfica', 'Verificação de restrições', 'Relatório técnico'],
        points: 30
      }
    ]
  },
  {
    id: 'briefing',
    name: 'Briefing',
    description: 'Etapa de definição de requisitos e necessidades do cliente',
    isContracted: false,
    tasks: [
      {
        id: 'bri_01',
        name: 'Reunião de briefing',
        description: 'Reunião inicial para entendimento das necessidades do cliente',
        estimatedDays: 1,
        priority: 'high',
        dependencies: [],
        technicalSteps: ['Preparação da reunião', 'Condução do briefing', 'Documentação dos requisitos'],
        points: 40
      },
      {
        id: 'bri_02',
        name: 'Programa de necessidades',
        description: 'Elaboração detalhada do programa de necessidades',
        estimatedDays: 2,
        priority: 'high',
        dependencies: ['bri_01'],
        technicalSteps: ['Análise dos requisitos', 'Definição de ambientes', 'Dimensionamento preliminar'],
        points: 60
      },
      {
        id: 'bri_03',
        name: 'Análise de viabilidade',
        description: 'Verificação da viabilidade técnica e legal do projeto',
        estimatedDays: 3,
        priority: 'medium',
        dependencies: ['bri_02'],
        normativeRequirements: 'Código de Obras Municipal',
        technicalSteps: ['Análise legal', 'Viabilidade técnica', 'Relatório de viabilidade'],
        points: 80
      }
    ]
  },
  {
    id: 'layout',
    name: 'Layout',
    description: 'Etapa de desenvolvimento do layout e distribuição dos ambientes',
    isContracted: false,
    tasks: [
      {
        id: 'lay_01',
        name: 'Estudo preliminar',
        description: 'Desenvolvimento de estudos preliminares de layout',
        estimatedDays: 5,
        priority: 'high',
        dependencies: [],
        technicalSteps: ['Análise do programa', 'Estudos de implantação', 'Alternativas de layout'],
        points: 100
      },
      {
        id: 'lay_02',
        name: 'Definição do layout',
        description: 'Definição final do layout dos ambientes',
        estimatedDays: 4,
        priority: 'high',
        dependencies: ['lay_01'],
        technicalSteps: ['Refinamento do layout', 'Validação com cliente', 'Aprovação final'],
        points: 90
      },
      {
        id: 'lay_03',
        name: 'Plantas baixas',
        description: 'Elaboração das plantas baixas técnicas',
        estimatedDays: 6,
        priority: 'medium',
        dependencies: ['lay_02'],
        technicalSteps: ['Desenho técnico', 'Cotagem', 'Especificações básicas'],
        points: 120
      }
    ]
  },
  {
    id: 'executivo',
    name: 'Projeto Executivo',
    description: 'Etapa de desenvolvimento dos projetos executivos especializados',
    isContracted: false,
    tasks: [
      {
        id: 'exe_01',
        name: 'Projeto estrutural',
        description: 'Desenvolvimento do projeto estrutural completo',
        estimatedDays: 15,
        priority: 'high',
        dependencies: [],
        normativeRequirements: 'NBR 6118 - Projeto de estruturas de concreto',
        technicalSteps: ['Análise estrutural', 'Dimensionamento', 'Detalhamento', 'Memorial de cálculo'],
        points: 200
      },
      {
        id: 'exe_02',
        name: 'Projeto elétrico',
        description: 'Projeto das instalações elétricas',
        estimatedDays: 10,
        priority: 'high',
        dependencies: ['exe_01'],
        normativeRequirements: 'NBR 5410 - Instalações elétricas de baixa tensão',
        technicalSteps: ['Dimensionamento elétrico', 'Plantas de instalação', 'Memorial descritivo'],
        points: 150
      },
      {
        id: 'exe_03',
        name: 'Projeto hidrossanitário',
        description: 'Projeto das instalações hidráulicas e sanitárias',
        estimatedDays: 8,
        priority: 'high',
        dependencies: ['exe_01'],
        normativeRequirements: 'NBR 5626 - Instalação predial de água fria',
        technicalSteps: ['Dimensionamento hidráulico', 'Plantas de instalação', 'Especificações técnicas'],
        points: 130
      },
      {
        id: 'exe_04',
        name: 'Projeto de prevenção contra incêndio',
        description: 'Projeto de segurança contra incêndio e pânico',
        estimatedDays: 6,
        priority: 'medium',
        dependencies: ['exe_02'],
        normativeRequirements: 'IT (Instruções Técnicas do Corpo de Bombeiros)',
        technicalSteps: ['Análise de risco', 'Sistema de detecção', 'Rotas de fuga', 'Equipamentos'],
        points: 110
      }
    ]
  },
  {
    id: 'interiores',
    name: 'Interiores',
    description: 'Etapa de desenvolvimento do projeto de interiores',
    isContracted: false,
    tasks: [
      {
        id: 'int_01',
        name: 'Conceito de interiores',
        description: 'Desenvolvimento do conceito e estilo dos interiores',
        estimatedDays: 4,
        priority: 'medium',
        dependencies: [],
        technicalSteps: ['Pesquisa de referências', 'Definição de conceito', 'Paleta de cores'],
        points: 70
      },
      {
        id: 'int_02',
        name: 'Projeto de mobiliário',
        description: 'Projeto e especificação do mobiliário',
        estimatedDays: 8,
        priority: 'medium',
        dependencies: ['int_01'],
        technicalSteps: ['Layout de mobiliário', 'Especificações', 'Detalhamentos'],
        points: 140
      },
      {
        id: 'int_03',
        name: 'Projeto de iluminação',
        description: 'Projeto luminotécnico dos ambientes',
        estimatedDays: 5,
        priority: 'medium',
        dependencies: ['int_01'],
        technicalSteps: ['Cálculo luminotécnico', 'Especificação de luminárias', 'Plantas de iluminação'],
        points: 90
      },
      {
        id: 'int_04',
        name: 'Especificação de materiais',
        description: 'Especificação detalhada de materiais e acabamentos',
        estimatedDays: 6,
        priority: 'low',
        dependencies: ['int_02'],
        technicalSteps: ['Pesquisa de materiais', 'Especificações técnicas', 'Orçamento preliminar'],
        points: 80
      }
    ]
  },
  {
    id: 'detalhamentos',
    name: 'Detalhamentos',
    description: 'Etapa de detalhamento construtivo e especificações finais',
    isContracted: false,
    tasks: [
      {
        id: 'det_01',
        name: 'Detalhes construtivos',
        description: 'Elaboração de detalhes construtivos específicos',
        estimatedDays: 10,
        priority: 'high',
        dependencies: [],
        technicalSteps: ['Identificação de detalhes', 'Desenho técnico', 'Especificações construtivas'],
        points: 160
      },
      {
        id: 'det_02',
        name: 'Memorial descritivo',
        description: 'Elaboração do memorial descritivo completo',
        estimatedDays: 5,
        priority: 'medium',
        dependencies: ['det_01'],
        technicalSteps: ['Descrição técnica', 'Especificações de materiais', 'Métodos construtivos'],
        points: 100
      },
      {
        id: 'det_03',
        name: 'Quantitativo de materiais',
        description: 'Levantamento quantitativo detalhado de materiais',
        estimatedDays: 7,
        priority: 'medium',
        dependencies: ['det_01'],
        technicalSteps: ['Levantamento quantitativo', 'Planilha de materiais', 'Orçamento detalhado'],
        points: 120
      },
      {
        id: 'det_04',
        name: 'Revisão final',
        description: 'Revisão geral de todos os projetos e documentos',
        estimatedDays: 3,
        priority: 'high',
        dependencies: ['det_02', 'det_03'],
        technicalSteps: ['Revisão técnica', 'Compatibilização', 'Aprovação final'],
        points: 80
      }
    ]
  }
]

export default function NovoProjetoPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'client' | 'project' | 'template'>('client')
  const [isNewClient, setIsNewClient] = useState(true)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [customizedStageTemplates, setCustomizedStageTemplates] = useState<StageTemplate[]>([])
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null)
  const [newTaskTemplate, setNewTaskTemplate] = useState<Partial<TaskTemplate>>({})

  // Estados para dados do cliente
  const [newClient, setNewClient] = useState<Partial<Client>>({
    personalAddress: {},
    workAddress: { isDifferent: false },
    additionalContacts: {},
    bankingInfo: {},
    projectResponsibles: []
  })

  // Estados para dados do projeto
  const [newProject, setNewProject] = useState<any>({})

  // Clientes existentes (simulado - em produção viria de uma API)
  const [clients] = useState<Client[]>([
    {
      id: '1',
      fullName: 'Maria Silva Santos',
      phone: '(11) 99999-9999',
      email: 'maria.silva@email.com',
      personalAddress: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Jardim Paulista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      workAddress: {
        street: 'Av. Paulista',
        number: '1000',
        complement: '',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        isDifferent: true
      },
      document: '123.456.789-00',
      birthDate: '1985-03-15',
      profession: 'Arquiteta',
      maritalStatus: 'Casada',
      additionalContacts: {
        alternativePhone: '(11) 88888-8888',
        emergencyContact: 'João Silva Santos',
        emergencyPhone: '(11) 77777-7777'
      },
      observations: 'Cliente preferencial, gosta de projetos modernos e sustentáveis.',
      bankingInfo: {
        bank: 'Banco do Brasil',
        agency: '1234-5',
        account: '12345-6',
        accountType: 'Conta Corrente'
      },
      projectResponsibles: ['Maria Silva Santos', 'João Silva Santos'],
      createdAt: '2024-01-15'
    }
  ])

  // Etapas disponíveis (simulado)
  const stages = [
    { id: '1', name: 'Medição' },
    { id: '2', name: 'Briefing' },
    { id: '3', name: 'Layout' },
    { id: '4', name: 'Fachada' },
    { id: '5', name: 'Executivo' },
    { id: '6', name: 'Interiores' },
    { id: '7', name: 'Detalhamentos' }
  ]

  // Funções auxiliares
  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'residential': return <Home className="w-5 h-5" />
      case 'commercial': return <Building className="w-5 h-5" />
      case 'industrial': return <Factory className="w-5 h-5" />
      case 'renovation': return <Wrench className="w-5 h-5" />
      default: return <Building className="w-5 h-5" />
    }
  }

  const getProjectTypeName = (type: string) => {
    switch (type) {
      case 'residential': return 'Residencial'
      case 'commercial': return 'Comercial'
      case 'industrial': return 'Industrial'
      case 'renovation': return 'Reforma'
      default: return 'Projeto'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  // Funções para gerenciar templates
  const toggleStageContract = (stageId: string) => {
    setCustomizedStageTemplates(prev => 
      prev.map(stage => 
        stage.id === stageId 
          ? { ...stage, isContracted: !stage.isContracted }
          : stage
      )
    )
  }

  const toggleStageExpansion = (stageId: string) => {
    setExpandedStages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stageId)) {
        newSet.delete(stageId)
      } else {
        newSet.add(stageId)
      }
      return newSet
    })
  }

  const updateTaskInStage = (stageId: string, taskIndex: number, updates: Partial<TaskTemplate>) => {
    setCustomizedStageTemplates(prev => 
      prev.map(stage => 
        stage.id === stageId 
          ? {
              ...stage,
              tasks: stage.tasks.map((task, index) => 
                index === taskIndex ? { ...task, ...updates } : task
              )
            }
          : stage
      )
    )
  }

  const addTaskToStage = (stageId: string) => {
    if (newTaskTemplate.name && newTaskTemplate.description) {
      const newTask: TaskTemplate = {
        id: `${stageId}_custom_${Date.now()}`,
        name: newTaskTemplate.name,
        description: newTaskTemplate.description,
        estimatedDays: newTaskTemplate.estimatedDays || 1,
        priority: newTaskTemplate.priority || 'medium',
        dependencies: newTaskTemplate.dependencies || [],
        normativeRequirements: newTaskTemplate.normativeRequirements,
        technicalSteps: newTaskTemplate.technicalSteps,
        points: newTaskTemplate.points || 10
      }
      
      setCustomizedStageTemplates(prev => 
        prev.map(stage => 
          stage.id === stageId 
            ? { ...stage, tasks: [...stage.tasks, newTask] }
            : stage
        )
      )
      setNewTaskTemplate({})
    }
  }

  const removeTaskFromStage = (stageId: string, taskIndex: number) => {
    setCustomizedStageTemplates(prev => 
      prev.map(stage => 
        stage.id === stageId 
          ? {
              ...stage,
              tasks: stage.tasks.filter((_, index) => index !== taskIndex)
            }
          : stage
      )
    )
  }

  // Função para avançar entre etapas
  const handleNextStep = () => {
    if (currentStep === 'client') {
      if (isNewClient) {
        // Validar dados do novo cliente
        if (!newClient.fullName || !newClient.phone || !newClient.email) {
          alert('Preencha os campos obrigatórios do cliente')
          return
        }
      } else if (!selectedClient) {
        alert('Selecione um cliente existente')
        return
      }
      
      // Inicializar templates customizados
      const initialTemplates = defaultStageTemplates.map(stage => ({
        ...stage,
        isContracted: false
      }))
      setCustomizedStageTemplates(initialTemplates)
      setCurrentStep('project')
    } else if (currentStep === 'project') {
      if (!newProject.projectName || !newProject.projectType) {
        alert('Preencha os campos obrigatórios do projeto')
        return
      }
      setCurrentStep('template')
    } else {
      // Finalizar e criar projeto
      handleCreateProject()
    }
  }

  const handlePreviousStep = () => {
    if (currentStep === 'template') {
      setCurrentStep('project')
    } else if (currentStep === 'project') {
      setCurrentStep('client')
    } else {
      router.push('/')
    }
  }

  const handleCreateProject = () => {
    // Aqui você salvaria o projeto na base de dados
    console.log('Criando projeto:', {
      client: isNewClient ? newClient : selectedClient,
      project: newProject,
      templates: customizedStageTemplates.filter(stage => stage.isContracted)
    })
    
    // Redirecionar de volta para a página principal
    router.push('/')
  }

  // Calcular estatísticas do template
  const getTemplateStats = () => {
    const contractedStages = customizedStageTemplates.filter(stage => stage.isContracted)
    const totalTasks = contractedStages.reduce((sum, stage) => sum + stage.tasks.length, 0)
    const totalPoints = contractedStages.reduce((sum, stage) => 
      sum + stage.tasks.reduce((taskSum, task) => taskSum + (task.points || 0), 0), 0
    )
    const totalDays = contractedStages.reduce((sum, stage) => 
      sum + stage.tasks.reduce((taskSum, task) => taskSum + task.estimatedDays, 0), 0
    )

    return { contractedStages: contractedStages.length, totalTasks, totalPoints, totalDays }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Logo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar ao Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-4">
                <img 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/4d684e30-9d10-41bf-8d48-28c833b9f901.png" 
                  alt="CooArq Logo" 
                  className="h-8 w-auto"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Novo Projeto
                  </h1>
                  <p className="text-sm text-gray-600">
                    {currentStep === 'client' ? 'Configuração do Cliente' : 
                     currentStep === 'project' ? 'Informações do Projeto' : 
                     'Seleção de Serviços'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Indicador de progresso */}
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'client' ? 'bg-[#FF7F00] text-white' : 'bg-green-500 text-white'
              }`}>
                1
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'project' ? 'bg-[#FF7F00] text-white' : 
                currentStep === 'template' ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'template' ? 'bg-[#FF7F00] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Etapa 1: Cliente */}
        {currentStep === 'client' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Dados do Cliente</h2>
              <p className="text-gray-600">Primeiro, vamos configurar os dados do cliente para este projeto</p>
            </div>

            {/* Seleção: Novo cliente ou existente */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl text-center">Como deseja proceder?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button
                    variant={isNewClient ? "default" : "outline"}
                    onClick={() => setIsNewClient(true)}
                    className={`h-auto p-6 flex flex-col items-center gap-3 ${
                      isNewClient ? 'bg-[#FF7F00] hover:bg-[#FF6B00] text-white' : ''
                    }`}
                  >
                    <Users className="w-8 h-8" />
                    <div className="text-center">
                      <div className="font-medium text-lg">Cadastrar Novo Cliente</div>
                      <p className="text-sm opacity-75 mt-1">Preencher dados completos do cliente</p>
                    </div>
                  </Button>
                  <Button
                    variant={!isNewClient ? "default" : "outline"}
                    onClick={() => setIsNewClient(false)}
                    className={`h-auto p-6 flex flex-col items-center gap-3 ${
                      !isNewClient ? 'bg-[#FF7F00] hover:bg-[#FF6B00] text-white' : ''
                    }`}
                  >
                    <User className="w-8 h-8" />
                    <div className="text-center">
                      <div className="font-medium text-lg">Cliente Existente</div>
                      <p className="text-sm opacity-75 mt-1">Selecionar de clientes cadastrados</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isNewClient ? (
              /* Formulário de novo cliente */
              <div className="max-w-6xl mx-auto space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Dados Essenciais do Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="fullName">Nome Completo *</Label>
                        <Input
                          id="fullName"
                          value={newClient.fullName || ''}
                          onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
                          placeholder="Nome completo do cliente"
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                        <Input
                          id="phone"
                          value={newClient.phone || ''}
                          onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                          placeholder="(11) 99999-9999"
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newClient.email || ''}
                          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                          placeholder="cliente@email.com"
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="document">CPF/CNPJ</Label>
                        <Input
                          id="document"
                          value={newClient.document || ''}
                          onChange={(e) => setNewClient({ ...newClient, document: e.target.value })}
                          placeholder="000.000.000-00"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profession">Profissão</Label>
                        <Input
                          id="profession"
                          value={newClient.profession || ''}
                          onChange={(e) => setNewClient({ ...newClient, profession: e.target.value })}
                          placeholder="Profissão do cliente"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={newClient.birthDate || ''}
                          onChange={(e) => setNewClient({ ...newClient, birthDate: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Endereço Principal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-2">
                        <Label htmlFor="street">Logradouro</Label>
                        <Input
                          id="street"
                          value={newClient.personalAddress?.street || ''}
                          onChange={(e) => setNewClient({ 
                            ...newClient, 
                            personalAddress: { ...newClient.personalAddress, street: e.target.value }
                          })}
                          placeholder="Rua, Avenida, etc."
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="number">Número</Label>
                        <Input
                          id="number"
                          value={newClient.personalAddress?.number || ''}
                          onChange={(e) => setNewClient({ 
                            ...newClient, 
                            personalAddress: { ...newClient.personalAddress, number: e.target.value }
                          })}
                          placeholder="123"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                          id="complement"
                          value={newClient.personalAddress?.complement || ''}
                          onChange={(e) => setNewClient({ 
                            ...newClient, 
                            personalAddress: { ...newClient.personalAddress, complement: e.target.value }
                          })}
                          placeholder="Apto, Sala, etc."
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input
                          id="neighborhood"
                          value={newClient.personalAddress?.neighborhood || ''}
                          onChange={(e) => setNewClient({ 
                            ...newClient, 
                            personalAddress: { ...newClient.personalAddress, neighborhood: e.target.value }
                          })}
                          placeholder="Bairro"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={newClient.personalAddress?.city || ''}
                          onChange={(e) => setNewClient({ 
                            ...newClient, 
                            personalAddress: { ...newClient.personalAddress, city: e.target.value }
                          })}
                          placeholder="Cidade"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={newClient.personalAddress?.state || ''}
                          onChange={(e) => setNewClient({ 
                            ...newClient, 
                            personalAddress: { ...newClient.personalAddress, state: e.target.value }
                          })}
                          placeholder="SP"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input
                          id="zipCode"
                          value={newClient.personalAddress?.zipCode || ''}
                          onChange={(e) => setNewClient({ 
                            ...newClient, 
                            personalAddress: { ...newClient.personalAddress, zipCode: e.target.value }
                          })}
                          placeholder="00000-000"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <p className="text-orange-700">
                    💡 <strong>Dica:</strong> Você pode adicionar mais informações detalhadas do cliente posteriormente nas configurações.
                  </p>
                </div>
              </div>
            ) : (
              /* Seleção de cliente existente */
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Selecionar Cliente Existente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="existingClient">Cliente</Label>
                      <Select onValueChange={(value) => {
                        const client = clients.find(c => c.id === value)
                        setSelectedClient(client || null)
                      }}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione um cliente cadastrado" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{client.fullName}</span>
                                <span className="text-sm text-gray-500">{client.phone} • {client.email}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedClient && (
                      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">✅ Cliente Selecionado</h4>
                        <div className="text-green-700">
                          <p><strong>{selectedClient.fullName}</strong></p>
                          <p>{selectedClient.phone} • {selectedClient.email}</p>
                          {selectedClient.personalAddress?.city && (
                            <p>{selectedClient.personalAddress.city}, {selectedClient.personalAddress.state}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Etapa 2: Projeto */}
        {currentStep === 'project' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Informações do Projeto</h2>
              <p className="text-gray-600">Configure os detalhes do projeto para este cliente</p>
            </div>

            {/* Informações do cliente selecionado */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Cliente Configurado
                </h4>
                <div className="text-green-700">
                  <p><strong>{selectedClient?.fullName || newClient.fullName}</strong></p>
                  <p>{selectedClient?.phone || newClient.phone} • {selectedClient?.email || newClient.email}</p>
                </div>
              </div>
            </div>

            {/* Formulário do projeto */}
            <div className="max-w-6xl mx-auto space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Dados do Projeto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="projectName">Nome do Projeto *</Label>
                      <Input
                        id="projectName"
                        value={newProject.projectName || ''}
                        onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                        placeholder="Ex: Residência Moderna"
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectType">Tipo de Obra *</Label>
                      <Select onValueChange={(value) => setNewProject({ ...newProject, projectType: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione o tipo de obra" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4" />
                              Residencial
                            </div>
                          </SelectItem>
                          <SelectItem value="commercial">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              Comercial
                            </div>
                          </SelectItem>
                          <SelectItem value="industrial">
                            <div className="flex items-center gap-2">
                              <Factory className="w-4 h-4" />
                              Industrial
                            </div>
                          </SelectItem>
                          <SelectItem value="renovation">
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4" />
                              Reforma
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stage">Etapa Inicial</Label>
                      <Select onValueChange={(value) => setNewProject({ ...newProject, stage: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione a etapa inicial" />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map(stage => (
                            <SelectItem key={stage.id} value={stage.name}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select onValueChange={(value) => setNewProject({ ...newProject, priority: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startDate">Data de Início</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newProject.startDate || ''}
                        onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline">Prazo Final</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newProject.deadline || ''}
                        onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <Label htmlFor="budget">Orçamento</Label>
                      <Input
                        id="budget"
                        value={newProject.budget || ''}
                        onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                        placeholder="R$ 0,00"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição do Projeto</Label>
                    <Textarea
                      id="description"
                      value={newProject.description || ''}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Descreva os detalhes e objetivos do projeto..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview do template */}
              {newProject.projectType && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <h4 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Template Aplicado: {getProjectTypeName(newProject.projectType)}
                  </h4>
                  <p className="text-orange-700 mb-4">
                    {defaultStageTemplates.reduce((total, stage) => total + stage.tasks.length, 0)} tarefas serão criadas automaticamente organizadas por etapas com dependências configuradas.
                  </p>
                  <div className="flex items-center gap-3 text-orange-600">
                    <Link className="w-5 h-5" />
                    <span>Na próxima etapa você poderá selecionar os serviços contratados e personalizar essas tarefas</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Etapa 3: Template */}
        {currentStep === 'template' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Configuração do Template</h2>
              <p className="text-gray-600">Selecione os serviços contratados e personalize as tarefas</p>
            </div>

            {/* Informações do projeto */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Projeto Configurado
                </h4>
                <div className="text-green-700">
                  <p><strong>{newProject.projectName}</strong> - {getProjectTypeName(newProject.projectType || '')}</p>
                  <p>Cliente: {selectedClient?.fullName || newClient.fullName}</p>
                </div>
              </div>
            </div>

            {/* Estatísticas do template */}
            {customizedStageTemplates.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-orange-900 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Resumo do Template
                    </h4>
                    <div className="flex gap-4">
                      {(() => {
                        const stats = getTemplateStats()
                        return (
                          <>
                            <Badge variant="outline" className="bg-white/60">
                              {stats.contractedStages} etapas
                            </Badge>
                            <Badge variant="outline" className="bg-white/60">
                              {stats.totalTasks} tarefas
                            </Badge>
                            <Badge variant="outline" className="bg-white/60">
                              {stats.totalPoints} pontos
                            </Badge>
                            <Badge variant="outline" className="bg-white/60">
                              {stats.totalDays} dias
                            </Badge>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Seleção de Serviços */}
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h4 className="font-medium text-yellow-900 mb-3">💡 Personalize seu fluxo de trabalho</h4>
                <p className="text-yellow-700">
                  Selecione quais serviços foram contratados pelo cliente. Apenas as etapas marcadas serão incluídas no projeto. 
                  Você pode expandir cada etapa para personalizar as tarefas específicas.
                </p>
              </div>

              {/* Lista de etapas/serviços */}
              <div className="space-y-6">
                {customizedStageTemplates.map((stageTemplate) => (
                  <Card key={stageTemplate.id} className={`transition-all duration-200 ${
                    stageTemplate.isContracted 
                      ? 'border-l-4 border-l-[#FF7F00] bg-orange-50/30' 
                      : 'border-l-4 border-l-gray-300'
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={stageTemplate.isContracted}
                            onCheckedChange={() => toggleStageContract(stageTemplate.id)}
                            className="w-5 h-5"
                          />
                          <div>
                            <CardTitle className="text-lg">{stageTemplate.name}</CardTitle>
                            <p className="text-gray-600 mt-1">{stageTemplate.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {stageTemplate.tasks.length} tarefas
                          </Badge>
                          <Badge variant="outline">
                            {stageTemplate.tasks.reduce((sum, task) => sum + (task.points || 0), 0)} pts
                          </Badge>
                          {stageTemplate.isContracted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStageExpansion(stageTemplate.id)}
                            >
                              {expandedStages.has(stageTemplate.id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {/* Personalização de Tarefas - Expandido */}
                    {stageTemplate.isContracted && expandedStages.has(stageTemplate.id) && (
                      <CardContent className="pt-0">
                        <div className="space-y-4 border-t pt-4">
                          <h5 className="font-medium text-gray-900">Tarefas da Etapa:</h5>
                          
                          {/* Lista de tarefas editáveis */}
                          <div className="space-y-4">
                            {stageTemplate.tasks.map((task, taskIndex) => (
                              <Card key={task.id} className="border border-gray-200">
                                <CardContent className="p-4">
                                  {editingTaskIndex === `${stageTemplate.id}-${taskIndex}` ? (
                                    // Modo de edição
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <Label>Nome da Tarefa</Label>
                                          <Input
                                            value={task.name}
                                            onChange={(e) => updateTaskInStage(stageTemplate.id, taskIndex, { name: e.target.value })}
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <Label>Dias Estimados</Label>
                                          <Input
                                            type="number"
                                            value={task.estimatedDays}
                                            onChange={(e) => updateTaskInStage(stageTemplate.id, taskIndex, { estimatedDays: parseInt(e.target.value) || 1 })}
                                            min="1"
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <Label>Pontuação</Label>
                                          <Input
                                            type="number"
                                            value={task.points || 0}
                                            onChange={(e) => updateTaskInStage(stageTemplate.id, taskIndex, { points: parseInt(e.target.value) || 0 })}
                                            min="0"
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <Label>Prioridade</Label>
                                          <Select 
                                            value={task.priority} 
                                            onValueChange={(value) => updateTaskInStage(stageTemplate.id, taskIndex, { priority: value as any })}
                                          >
                                            <SelectTrigger className="mt-1">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="low">Baixa</SelectItem>
                                              <SelectItem value="medium">Média</SelectItem>
                                              <SelectItem value="high">Alta</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Descrição</Label>
                                        <Textarea
                                          value={task.description}
                                          onChange={(e) => updateTaskInStage(stageTemplate.id, taskIndex, { description: e.target.value })}
                                          rows={3}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => setEditingTaskIndex(null)}
                                          className="bg-[#FF7F00] hover:bg-[#FF6B00]"
                                        >
                                          <Save className="w-4 h-4 mr-2" />
                                          Salvar
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingTaskIndex(null)}
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    // Modo de visualização
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start gap-3 flex-1">
                                        <span className="w-6 h-6 bg-orange-100 text-[#FF7F00] rounded-full flex items-center justify-center text-sm font-medium">
                                          {taskIndex + 1}
                                        </span>
                                        <div className="flex-1">
                                          <h6 className="font-medium">{task.name}</h6>
                                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                          {task.normativeRequirements && (
                                            <p className="text-sm text-blue-600 mt-1">
                                              📋 {task.normativeRequirements}
                                            </p>
                                          )}
                                          {task.dependencies.length > 0 && (
                                            <div className="flex items-center gap-1 mt-1">
                                              <Link className="w-3 h-3 text-gray-400" />
                                              <span className="text-sm text-gray-500">
                                                Depende de: {task.dependencies.length} tarefa(s)
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {task.estimatedDays}d
                                        </Badge>
                                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                                          <Star className="w-3 h-3" />
                                          {task.points || 0}
                                        </Badge>
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEditingTaskIndex(`${stageTemplate.id}-${taskIndex}`)}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeTaskFromStage(stageTemplate.id, taskIndex)}
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          {/* Adicionar nova tarefa */}
                          <Card className="border-2 border-dashed border-gray-300">
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                <h6 className="font-medium text-gray-700">Adicionar Nova Tarefa</h6>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Input
                                    placeholder="Nome da tarefa"
                                    value={newTaskTemplate.name || ''}
                                    onChange={(e) => setNewTaskTemplate({ ...newTaskTemplate, name: e.target.value })}
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Dias estimados"
                                    value={newTaskTemplate.estimatedDays || ''}
                                    onChange={(e) => setNewTaskTemplate({ ...newTaskTemplate, estimatedDays: parseInt(e.target.value) || 1 })}
                                    min="1"
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Pontuação"
                                    value={newTaskTemplate.points || ''}
                                    onChange={(e) => setNewTaskTemplate({ ...newTaskTemplate, points: parseInt(e.target.value) || 10 })}
                                    min="0"
                                  />
                                </div>
                                <Textarea
                                  placeholder="Descrição da tarefa"
                                  value={newTaskTemplate.description || ''}
                                  onChange={(e) => setNewTaskTemplate({ ...newTaskTemplate, description: e.target.value })}
                                  rows={3}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => addTaskToStage(stageTemplate.id)}
                                  disabled={!newTaskTemplate.name || !newTaskTemplate.description}
                                  className="bg-[#FF7F00] hover:bg-[#FF6B00]"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Adicionar Tarefa
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Botões de navegação */}
        <div className="flex justify-between pt-8 border-t max-w-7xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 'client' ? 'Cancelar' : 'Voltar'}
          </Button>
          <Button
            onClick={handleNextStep}
            className="bg-gradient-to-r from-[#FF7F00] to-[#FF9500] hover:from-[#FF6B00] hover:to-[#FF8C00] flex items-center gap-2"
            disabled={
              currentStep === 'client' 
                ? (isNewClient ? !newClient.fullName || !newClient.phone || !newClient.email : !selectedClient)
                : currentStep === 'project'
                ? !newProject.projectName || !newProject.projectType
                : customizedStageTemplates.filter(stage => stage.isContracted).length === 0
            }
          >
            {currentStep === 'template' ? (
              <>
                <Save className="w-4 h-4" />
                Criar Projeto
              </>
            ) : (
              'Próximo'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}