"use client"

import { useState, useCallback, useMemo } from 'react'
import { Plus, Settings, User, Calendar, Clock, CheckCircle, Circle, AlertCircle, MoreHorizontal, Edit, Trash2, X, Check, GripVertical, Users, ClipboardList, UserPlus, Cog, Link, Building, Home, Factory, Wrench, ArrowRight, ChevronRight, Sparkles, Target, Briefcase, ArrowLeft, Save, FileText, ChevronDown, ChevronUp, Award, Star, Search, Filter, SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Tipos de dados
interface TaskTemplate {
  id: string
  name: string
  description: string
  estimatedDays: number
  priority: 'low' | 'medium' | 'high'
  dependencies: string[]
  normativeRequirements?: string
  technicalSteps?: string[]
  points?: number // Sistema de pontuação
}

interface StageTemplate {
  id: string
  name: string
  description: string
  tasks: TaskTemplate[]
  isContracted?: boolean // Se o serviço foi contratado
}

interface Task {
  id: string
  name: string
  description: string
  responsible: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  deadline: string
  priority: 'low' | 'medium' | 'high'
  projectId: string
  clientName: string
  dependencies: string[]
  estimatedDays: number
  normativeRequirements?: string
  technicalSteps?: string[]
  templateId?: string
  stageId?: string
  points?: number
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

interface Project {
  id: string
  clientId: string
  clientName: string
  projectName: string
  projectType: 'residential' | 'commercial' | 'industrial' | 'renovation'
  stage: string
  startDate: string
  deadline: string
  budget: string
  description: string
  tasks: Task[]
  priority: 'low' | 'medium' | 'high'
  templateId?: string
}

interface Stage {
  id: string
  name: string
  color: string
}

interface User {
  id: string
  name: string
  role: 'admin' | 'manager' | 'user'
}

interface FieldConfig {
  id: string
  label: string
  required: boolean
  visible: boolean
}

// Templates de etapas com tarefas específicas e pontuação - ATUALIZADO
const defaultStageTemplates: StageTemplate[] = [
  {
    id: 'medicao',
    name: 'Medição',
    description: 'Etapa de levantamento e medição do local',
    isContracted: false,
    tasks: [
      {
        id: 'med_01',
        name: 'Medição in-loco',
        description: 'Realizar medição completa do terreno e construção existente no local',
        estimatedDays: 2,
        priority: 'high',
        dependencies: [],
        normativeRequirements: 'NBR 13133 - Execução de levantamento topográfico',
        technicalSteps: ['Preparação de equipamentos', 'Medição de campo', 'Registro fotográfico'],
        points: 80
      },
      {
        id: 'med_02',
        name: 'Desenho Medição',
        description: 'Elaboração do desenho técnico baseado nas medições realizadas',
        estimatedDays: 3,
        priority: 'high',
        dependencies: ['med_01'],
        technicalSteps: ['Processamento dos dados', 'Desenho técnico', 'Revisão e validação'],
        points: 150
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
        name: 'Reunião de Briefing',
        description: 'Reunião inicial para entendimento das necessidades do cliente',
        estimatedDays: 1,
        priority: 'high',
        dependencies: [],
        technicalSteps: ['Preparação da reunião', 'Condução do briefing', 'Documentação dos requisitos'],
        points: 80
      }
    ]
  },
  {
    id: 'layout',
    name: 'LayOut',
    description: 'Etapa de desenvolvimento do layout e distribuição dos ambientes',
    isContracted: false,
    tasks: [
      {
        id: 'lay_01',
        name: 'LayOut Aprovado',
        description: 'Desenvolvimento e aprovação do layout dos ambientes',
        estimatedDays: 7,
        priority: 'high',
        dependencies: [],
        technicalSteps: ['Análise do programa', 'Estudos de implantação', 'Alternativas de layout', 'Aprovação do cliente'],
        points: 980
      },
      {
        id: 'lay_02',
        name: 'LayOut Detalhamento',
        description: 'Detalhamento técnico do layout aprovado',
        estimatedDays: 4,
        priority: 'high',
        dependencies: ['lay_01'],
        technicalSteps: ['Refinamento do layout', 'Detalhamento técnico', 'Especificações'],
        points: 200
      },
      {
        id: 'lay_03',
        name: 'Apresentação LayOut',
        description: 'Apresentação final do layout para o cliente',
        estimatedDays: 1,
        priority: 'medium',
        dependencies: ['lay_02'],
        technicalSteps: ['Preparação da apresentação', 'Apresentação ao cliente', 'Ajustes finais'],
        points: 100
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
        name: 'Planta Baixa/Cortes/Elevação/Demolir-Construir/Cobertura',
        description: 'Desenvolvimento completo dos desenhos técnicos do projeto',
        estimatedDays: 15,
        priority: 'high',
        dependencies: [],
        normativeRequirements: 'NBR 6492 - Representação de projetos de arquitetura',
        technicalSteps: ['Plantas baixas', 'Cortes', 'Elevações', 'Planta de demolição', 'Planta de construção', 'Planta de cobertura'],
        points: 300
      },
      {
        id: 'exe_02',
        name: 'Esquemático Hidráulico',
        description: 'Projeto esquemático das instalações hidráulicas',
        estimatedDays: 5,
        priority: 'high',
        dependencies: ['exe_01'],
        normativeRequirements: 'NBR 5626 - Instalação predial de água fria',
        technicalSteps: ['Dimensionamento hidráulico', 'Esquemas de instalação', 'Especificações básicas'],
        points: 100
      },
      {
        id: 'exe_03',
        name: 'Esquemático Elétrico',
        description: 'Projeto esquemático das instalações elétricas',
        estimatedDays: 8,
        priority: 'high',
        dependencies: ['exe_01'],
        normativeRequirements: 'NBR 5410 - Instalações elétricas de baixa tensão',
        technicalSteps: ['Dimensionamento elétrico', 'Esquemas de instalação', 'Quadro de cargas'],
        points: 200
      },
      {
        id: 'exe_04',
        name: 'Esquemático Estrutural',
        description: 'Projeto esquemático da estrutura',
        estimatedDays: 10,
        priority: 'high',
        dependencies: ['exe_01'],
        normativeRequirements: 'NBR 6118 - Projeto de estruturas de concreto',
        technicalSteps: ['Análise estrutural', 'Dimensionamento básico', 'Esquemas estruturais'],
        points: 200
      },
      {
        id: 'exe_05',
        name: 'Projeto Luminotécnico',
        description: 'Projeto de iluminação dos ambientes',
        estimatedDays: 6,
        priority: 'medium',
        dependencies: ['exe_03'],
        technicalSteps: ['Cálculo luminotécnico', 'Especificação de luminárias', 'Plantas de iluminação'],
        points: 200
      }
    ]
  },
  {
    id: 'alvara',
    name: 'Aprovação Alvará de Construção',
    description: 'Etapa de aprovação legal do projeto',
    isContracted: false,
    tasks: [
      {
        id: 'alv_01',
        name: 'Projeto Legal',
        description: 'Adequação do projeto às normas legais municipais',
        estimatedDays: 8,
        priority: 'high',
        dependencies: [],
        normativeRequirements: 'Código de Obras Municipal',
        technicalSteps: ['Adequação às normas', 'Documentação legal', 'Revisão técnica'],
        points: 200
      },
      {
        id: 'alv_02',
        name: 'Processo Alvará Construção',
        description: 'Tramitação do processo de aprovação do alvará',
        estimatedDays: 15,
        priority: 'high',
        dependencies: ['alv_01'],
        technicalSteps: ['Protocolo na prefeitura', 'Acompanhamento do processo', 'Retirada do alvará'],
        points: 200
      }
    ]
  },
  {
    id: 'fachada',
    name: 'Fachada',
    description: 'Etapa de desenvolvimento do projeto de fachada',
    isContracted: false,
    tasks: [
      {
        id: 'fac_01',
        name: 'Fachada Aprovada',
        description: 'Desenvolvimento e aprovação do projeto de fachada',
        estimatedDays: 12,
        priority: 'high',
        dependencies: [],
        technicalSteps: ['Estudos de fachada', 'Desenvolvimento do projeto', 'Aprovação do cliente'],
        points: 930
      },
      {
        id: 'fac_02',
        name: 'Apresentação Fachada',
        description: 'Apresentação final do projeto de fachada',
        estimatedDays: 1,
        priority: 'medium',
        dependencies: ['fac_01'],
        technicalSteps: ['Preparação da apresentação', 'Apresentação ao cliente', 'Documentação final'],
        points: 100
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
        name: 'Interior Cozinha (Cliente)',
        description: 'Projeto de interiores da cozinha personalizado para o cliente',
        estimatedDays: 8,
        priority: 'high',
        dependencies: [],
        technicalSteps: ['Levantamento de necessidades', 'Projeto de layout', 'Especificação de materiais', 'Detalhamento'],
        points: 500
      },
      {
        id: 'int_02',
        name: 'Interior Sala de Jantar (Cliente)',
        description: 'Projeto de interiores da sala de jantar',
        estimatedDays: 3,
        priority: 'medium',
        dependencies: [],
        technicalSteps: ['Conceito de design', 'Layout de mobiliário', 'Especificações'],
        points: 150
      },
      {
        id: 'int_03',
        name: 'Interior Sala de Estar (Cliente)',
        description: 'Projeto de interiores da sala de estar',
        estimatedDays: 4,
        priority: 'medium',
        dependencies: [],
        technicalSteps: ['Conceito de design', 'Layout de mobiliário', 'Especificações'],
        points: 200
      },
      {
        id: 'int_04',
        name: 'Interior BWC (Cliente)',
        description: 'Projeto de interiores do banheiro',
        estimatedDays: 4,
        priority: 'medium',
        dependencies: [],
        technicalSteps: ['Layout funcional', 'Especificação de louças', 'Revestimentos'],
        points: 200
      },
      {
        id: 'int_05',
        name: 'Interior Quarto (Cliente)',
        description: 'Projeto de interiores do quarto',
        estimatedDays: 6,
        priority: 'medium',
        dependencies: [],
        technicalSteps: ['Conceito de design', 'Layout de mobiliário', 'Especificações', 'Iluminação'],
        points: 380
      },
      {
        id: 'int_06',
        name: 'Interior Closet (Cliente)',
        description: 'Projeto de interiores do closet',
        estimatedDays: 3,
        priority: 'low',
        dependencies: [],
        technicalSteps: ['Layout funcional', 'Organização de espaços', 'Especificações'],
        points: 170
      },
      {
        id: 'int_07',
        name: 'Interior Escritório (Cliente)',
        description: 'Projeto de interiores do escritório',
        estimatedDays: 4,
        priority: 'medium',
        dependencies: [],
        technicalSteps: ['Layout funcional', 'Mobiliário ergonômico', 'Iluminação de trabalho'],
        points: 200
      },
      {
        id: 'int_08',
        name: 'Interior Lavanderia (Cliente)',
        description: 'Projeto de interiores da lavanderia',
        estimatedDays: 3,
        priority: 'low',
        dependencies: [],
        technicalSteps: ['Layout funcional', 'Especificação de equipamentos', 'Organização'],
        points: 250
      },
      {
        id: 'int_09',
        name: 'Interior Área Goumert (Cliente)',
        description: 'Projeto de interiores da área gourmet',
        estimatedDays: 7,
        priority: 'high',
        dependencies: [],
        technicalSteps: ['Conceito de design', 'Layout integrado', 'Especificação de equipamentos', 'Detalhamento'],
        points: 430
      },
      {
        id: 'int_10',
        name: 'Interior Lavabo (Cliente)',
        description: 'Projeto de interiores do lavabo',
        estimatedDays: 2,
        priority: 'low',
        dependencies: [],
        technicalSteps: ['Layout compacto', 'Especificação de materiais', 'Detalhes decorativos'],
        points: 180
      }
    ]
  },
  {
    id: 'detalhamentos',
    name: 'Detalhamento',
    description: 'Etapa de detalhamento construtivo e especificações finais',
    isContracted: false,
    tasks: [
      {
        id: 'det_01',
        name: 'Detalhamento Cozinha (Cliente)',
        description: 'Detalhamento construtivo da cozinha',
        estimatedDays: 5,
        priority: 'high',
        dependencies: [],
        technicalSteps: ['Detalhes construtivos', 'Especificações técnicas', 'Desenhos executivos'],
        points: 200
      },
      {
        id: 'det_02',
        name: 'Detalhamento Sala de Jantar (Cliente)',
        description: 'Detalhamento construtivo da sala de jantar',
        estimatedDays: 1,
        priority: 'low',
        dependencies: [],
        technicalSteps: ['Detalhes específicos', 'Especificações'],
        points: 30
      },
      {
        id: 'det_03',
        name: 'Detalhamento Sala de Estar (Cliente)',
        description: 'Detalhamento construtivo da sala de estar',
        estimatedDays: 2,
        priority: 'medium',
        dependencies: [],
        technicalSteps: ['Detalhes construtivos', 'Especificações técnicas'],
        points: 90
      },
      {
        id: 'det_04',
        name: 'Detalhamento BWC (Cliente)',
        description: 'Detalhamento construtivo do banheiro',
        estimatedDays: 2,
        priority: 'medium',
        dependencies: [],
        technicalSteps: ['Detalhes hidráulicos', 'Especificações de revestimentos'],
        points: 60
      },
      {
        id: 'det_05',
        name: 'Detalhamento Quarto (Cliente)',
        description: 'Detalhamento construtivo do quarto',
        estimatedDays: 3,
        priority: 'medium',
        dependencies: [],
        technicalSteps: ['Detalhes construtivos', 'Especificações técnicas', 'Detalhes de mobiliário'],
        points: 150
      },
      {
        id: 'det_06',
        name: 'Detalhamento Closet (Cliente)',
        description: 'Detalhamento construtivo do closet',
        estimatedDays: 2,
        priority: 'low',
        dependencies: [],
        technicalSteps: ['Detalhes de organização', 'Especificações de materiais'],
        points: 100
      },
      {
        id: 'det_07',
        name: 'Detalhamento Escritório (Cliente)',
        description: 'Detalhamento construtivo do escritório',
        estimatedDays: 3,
        priority: 'medium',
        dependencies: [],
        technicalSteps: ['Detalhes funcionais', 'Especificações técnicas', 'Detalhes elétricos'],
        points: 140
      },
      {
        id: 'det_08',
        name: 'Detalhamento Lavanderia',
        description: 'Detalhamento construtivo da lavanderia',
        estimatedDays: 2,
        priority: 'low',
        dependencies: [],
        technicalSteps: ['Detalhes hidráulicos', 'Especificações de equipamentos'],
        points: 130
      },
      {
        id: 'det_09',
        name: 'Detalhamento Área Goumert (Cliente)',
        description: 'Detalhamento construtivo da área gourmet',
        estimatedDays: 4,
        priority: 'high',
        dependencies: [],
        technicalSteps: ['Detalhes construtivos', 'Especificações técnicas', 'Detalhes de equipamentos'],
        points: 180
      },
      {
        id: 'det_10',
        name: 'Detalhamento Lavabo (Cliente)',
        description: 'Detalhamento construtivo do lavabo',
        estimatedDays: 1,
        priority: 'low',
        dependencies: [],
        technicalSteps: ['Detalhes específicos', 'Especificações básicas'],
        points: 50
      }
    ]
  }
]

// Dados iniciais - ATUALIZADO
const defaultStages: Stage[] = [
  { id: '1', name: 'Medição', color: 'bg-gradient-to-r from-[#FF7F00] to-[#FF9500]' },
  { id: '2', name: 'Briefing', color: 'bg-gradient-to-r from-[#FF7F00] to-[#FF6B00]' },
  { id: '3', name: 'LayOut', color: 'bg-gradient-to-r from-[#FF8C00] to-[#FF7F00]' },
  { id: '4', name: 'Projeto Executivo', color: 'bg-gradient-to-r from-[#FF6B00] to-[#FF7F00]' },
  { id: '5', name: 'Aprovação Alvará de Construção', color: 'bg-gradient-to-r from-[#FF9500] to-[#FF8C00]' },
  { id: '6', name: 'Fachada', color: 'bg-gradient-to-r from-[#FF7F00] to-[#FF9500]' },
  { id: '7', name: 'Interiores', color: 'bg-gradient-to-r from-[#FF8C00] to-[#FF6B00]' },
  { id: '8', name: 'Detalhamento', color: 'bg-gradient-to-r from-[#FF7F00] to-[#FF8C00]' }
]

const defaultFieldConfigs: FieldConfig[] = [
  { id: 'fullName', label: 'Nome Completo', required: true, visible: true },
  { id: 'phone', label: 'Telefone/WhatsApp', required: true, visible: true },
  { id: 'email', label: 'E-mail', required: true, visible: true },
  { id: 'personalAddress', label: 'Endereço Pessoal', required: true, visible: true },
  { id: 'workAddress', label: 'Endereço da Obra', required: false, visible: true },
  { id: 'document', label: 'CPF/CNPJ', required: true, visible: true },
  { id: 'birthDate', label: 'Data de Nascimento', required: false, visible: true },
  { id: 'profession', label: 'Profissão', required: false, visible: true },
  { id: 'maritalStatus', label: 'Estado Civil', required: false, visible: true },
  { id: 'additionalContacts', label: 'Contatos Adicionais', required: false, visible: true },
  { id: 'observations', label: 'Observações Gerais', required: false, visible: true },
  { id: 'bankingInfo', label: 'Dados Bancários', required: false, visible: true },
  { id: 'projectResponsibles', label: 'Responsáveis pelo Projeto', required: false, visible: true }
]

const sampleClients: Client[] = [
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
]

const sampleProjects: Project[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Maria Silva Santos',
    projectName: 'Residência Moderna',
    projectType: 'residential',
    stage: 'Medição',
    startDate: '2024-01-15',
    deadline: '2024-06-30',
    budget: 'R$ 450.000',
    description: 'Projeto residencial moderno com 3 quartos, área gourmet e piscina.',
    priority: 'high',
    tasks: [
      {
        id: '1',
        name: 'Medição in-loco',
        description: 'Realizar medição completa do terreno',
        responsible: 'João Santos',
        status: 'in-progress',
        deadline: '2024-01-25',
        priority: 'high',
        projectId: '1',
        clientName: 'Maria Silva Santos',
        dependencies: [],
        estimatedDays: 2,
        templateId: 'med_01',
        stageId: 'medicao',
        points: 80
      },
      {
        id: '2',
        name: 'Desenho Medição',
        description: 'Elaboração do desenho técnico baseado nas medições',
        responsible: 'Ana Costa',
        status: 'blocked',
        deadline: '2024-01-30',
        priority: 'high',
        projectId: '1',
        clientName: 'Maria Silva Santos',
        dependencies: ['1'],
        estimatedDays: 3,
        templateId: 'med_02',
        stageId: 'medicao',
        points: 150
      }
    ]
  }
]

export default function CooArqKanban() {
  const router = useRouter()
  const [stages, setStages] = useState<Stage[]>(defaultStages)
  const [projects, setProjects] = useState<Project[]>(sampleProjects)
  const [clients, setClients] = useState<Client[]>(sampleClients)
  const [stageTemplates, setStageTemplates] = useState<StageTemplate[]>(defaultStageTemplates)
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>(defaultFieldConfigs)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<StageTemplate | null>(null)
  const [newProject, setNewProject] = useState<Partial<Project>>({})
  const [newClient, setNewClient] = useState<Partial<Client>>({
    personalAddress: {},
    workAddress: { isDifferent: false },
    additionalContacts: {},
    bankingInfo: {},
    projectResponsibles: []
  })
  const [newTask, setNewTask] = useState<Partial<Task>>({})
  const [draggedProject, setDraggedProject] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Estados para gerenciamento de etapas
  const [isManagingStages, setIsManagingStages] = useState(false)
  const [editingStageId, setEditingStageId] = useState<string | null>(null)
  const [editingStageValue, setEditingStageValue] = useState('')
  const [draggedStage, setDraggedStage] = useState<string | null>(null)
  const [dragOverStageIndex, setDragOverStageIndex] = useState<number | null>(null)

  // Estados para controle de usuário e visualização
  const [currentUser] = useState<User>({ id: '1', name: 'Admin', role: 'admin' })
  const [currentView, setCurrentView] = useState<'projects' | 'tasks' | 'templates' | 'clients'>('projects')

  // Estados para drag and drop de tarefas
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverTaskStage, setDragOverTaskStage] = useState<string | null>(null)

  // Estados para busca e filtros - OTIMIZADOS
  const [searchTerm, setSearchTerm] = useState('')
  const [projectFilters, setProjectFilters] = useState({
    stage: '',
    priority: '',
    projectType: '',
    status: ''
  })
  const [taskFilters, setTaskFilters] = useState({
    status: '',
    priority: '',
    responsible: '',
    deadline: ''
  })
  const [clientFilters, setClientFilters] = useState({
    profession: '',
    city: '',
    state: ''
  })
  const [templateFilters, setTemplateFilters] = useState({
    stage: '',
    priority: ''
  })

  // Função para aplicar templates de etapa ao projeto
  const applyStageTemplates = (projectId: string, startDate: string, customStageTemplates?: StageTemplate[]) => {
    let allTasks: Task[] = []
    const projectStartDate = new Date(startDate)
    let currentDate = new Date(projectStartDate)

    const templatesToUse = customStageTemplates && customStageTemplates.length > 0 
      ? customStageTemplates.filter(stage => stage.isContracted) 
      : stageTemplates

    templatesToUse.forEach((stageTemplate, stageIndex) => {
      stageTemplate.tasks.forEach((taskTemplate, taskIndex) => {
        if (taskTemplate.dependencies.length > 0) {
          const dependencyDates = taskTemplate.dependencies.map(depId => {
            const depTask = allTasks.find(t => t.templateId === depId)
            if (depTask) {
              const depEndDate = new Date(depTask.deadline)
              return depEndDate
            }
            return currentDate
          })
          currentDate = new Date(Math.max(...dependencyDates.map(d => d.getTime())))
        } else if (taskIndex > 0 || stageIndex > 0) {
          currentDate.setDate(currentDate.getDate() + 1)
        }

        const taskStartDate = new Date(currentDate)
        const taskEndDate = new Date(taskStartDate)
        taskEndDate.setDate(taskEndDate.getDate() + taskTemplate.estimatedDays)

        const task: Task = {
          id: `${projectId}_${taskTemplate.id}_${Date.now()}_${allTasks.length}`,
          name: taskTemplate.name,
          description: taskTemplate.description,
          responsible: '',
          status: taskTemplate.dependencies.length === 0 ? 'pending' : 'blocked',
          deadline: taskEndDate.toISOString().split('T')[0],
          priority: taskTemplate.priority,
          projectId: projectId,
          clientName: '',
          dependencies: taskTemplate.dependencies.map(depId => {
            const depTask = allTasks.find(t => t.templateId === depId)
            return depTask ? depTask.id : ''
          }).filter(id => id !== ''),
          estimatedDays: taskTemplate.estimatedDays,
          normativeRequirements: taskTemplate.normativeRequirements,
          technicalSteps: taskTemplate.technicalSteps,
          templateId: taskTemplate.id,
          stageId: stageTemplate.id,
          points: taskTemplate.points || 0
        }

        allTasks.push(task)
        currentDate = new Date(taskEndDate)
      })
    })

    return allTasks
  }

  // Função para verificar e liberar tarefas dependentes
  const checkAndUnblockTasks = (completedTaskId: string, projectId: string) => {
    setProjects(prevProjects => 
      prevProjects.map(project => {
        if (project.id !== projectId) return project

        const updatedTasks = project.tasks.map(task => {
          if (task.dependencies.includes(completedTaskId) && task.status === 'blocked') {
            const allDependenciesCompleted = task.dependencies.every(depId => {
              const depTask = project.tasks.find(t => t.id === depId)
              return depTask?.status === 'completed'
            })

            if (allDependenciesCompleted) {
              return { ...task, status: 'pending' as const }
            }
          }
          return task
        })

        return { ...project, tasks: updatedTasks }
      })
    )
  }

  // Funções de filtro OTIMIZADAS com useCallback
  const filterProjects = useCallback((projects: Project[]) => {
    return projects.filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStage = projectFilters.stage === '' || projectFilters.stage === 'all' || project.stage === projectFilters.stage
      const matchesPriority = projectFilters.priority === '' || projectFilters.priority === 'all' || project.priority === projectFilters.priority
      const matchesType = projectFilters.projectType === '' || projectFilters.projectType === 'all' || project.projectType === projectFilters.projectType
      
      // Status baseado no progresso das tarefas
      let projectStatus = 'not-started'
      if (project.tasks.length > 0) {
        const completedTasks = project.tasks.filter(t => t.status === 'completed').length
        const totalTasks = project.tasks.length
        if (completedTasks === totalTasks) projectStatus = 'completed'
        else if (completedTasks > 0) projectStatus = 'in-progress'
        else projectStatus = 'not-started'
      }
      const matchesStatus = projectFilters.status === '' || projectFilters.status === 'all' || projectStatus === projectFilters.status

      return matchesSearch && matchesStage && matchesPriority && matchesType && matchesStatus
    })
  }, [searchTerm, projectFilters])

  const filterTasks = useCallback((tasks: Task[]) => {
    return tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.responsible.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = taskFilters.status === '' || taskFilters.status === 'all' || task.status === taskFilters.status
      const matchesPriority = taskFilters.priority === '' || taskFilters.priority === 'all' || task.priority === taskFilters.priority
      const matchesResponsible = taskFilters.responsible === '' || 
        task.responsible.toLowerCase().includes(taskFilters.responsible.toLowerCase())
      
      // Filtro por prazo
      let matchesDeadline = true
      if (taskFilters.deadline !== '' && taskFilters.deadline !== 'all') {
        const today = new Date()
        const taskDeadline = new Date(task.deadline)
        
        switch (taskFilters.deadline) {
          case 'overdue':
            matchesDeadline = taskDeadline < today && task.status !== 'completed'
            break
          case 'today':
            matchesDeadline = taskDeadline.toDateString() === today.toDateString()
            break
          case 'this-week':
            const nextWeek = new Date(today)
            nextWeek.setDate(nextWeek.getDate() + 7)
            matchesDeadline = taskDeadline >= today && taskDeadline <= nextWeek
            break
          case 'no-deadline':
            matchesDeadline = !task.deadline
            break
        }
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesResponsible && matchesDeadline
    })
  }, [searchTerm, taskFilters])

  const filterClients = useCallback((clients: Client[]) => {
    return clients.filter(client => {
      const matchesSearch = searchTerm === '' || 
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.profession.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesProfession = clientFilters.profession === '' || 
        client.profession.toLowerCase().includes(clientFilters.profession.toLowerCase())
      const matchesCity = clientFilters.city === '' || 
        client.personalAddress.city.toLowerCase().includes(clientFilters.city.toLowerCase())
      const matchesState = clientFilters.state === '' || clientFilters.state === 'all' || client.personalAddress.state === clientFilters.state

      return matchesSearch && matchesProfession && matchesCity && matchesState
    })
  }, [searchTerm, clientFilters])

  const filterTemplates = useCallback((templates: StageTemplate[]) => {
    return templates.filter(template => {
      const matchesSearch = searchTerm === '' || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tasks.some(task => 
          task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
        )

      const matchesStage = templateFilters.stage === '' || templateFilters.stage === 'all' || template.name === templateFilters.stage
      const matchesPriority = templateFilters.priority === '' || templateFilters.priority === 'all' || 
        template.tasks.some(task => task.priority === templateFilters.priority)

      return matchesSearch && matchesStage && matchesPriority
    })
  }, [searchTerm, templateFilters])

  // Funções para gerenciar clientes
  const addClient = () => {
    if (newClient.fullName && newClient.phone && newClient.email) {
      const client: Client = {
        id: Date.now().toString(),
        fullName: newClient.fullName,
        phone: newClient.phone,
        email: newClient.email,
        personalAddress: newClient.personalAddress || {},
        workAddress: newClient.workAddress,
        document: newClient.document || '',
        birthDate: newClient.birthDate || '',
        profession: newClient.profession || '',
        maritalStatus: newClient.maritalStatus || '',
        additionalContacts: newClient.additionalContacts || {},
        observations: newClient.observations || '',
        bankingInfo: newClient.bankingInfo || {},
        projectResponsibles: newClient.projectResponsibles || [],
        createdAt: new Date().toISOString().split('T')[0]
      }
      setClients([...clients, client])
      setNewClient({
        personalAddress: {},
        workAddress: { isDifferent: false },
        additionalContacts: {},
        bankingInfo: {},
        projectResponsibles: []
      })
      setIsClientModalOpen(false)
      return client
    }
    return null
  }

  const getFieldConfig = (fieldId: string) => {
    return fieldConfigs.find(config => config.id === fieldId) || { required: false, visible: true }
  }

  const updateFieldConfig = (fieldId: string, updates: Partial<FieldConfig>) => {
    setFieldConfigs(prev => prev.map(config => 
      config.id === fieldId ? { ...config, ...updates } : config
    ))
  }

  // Funções para gerenciar projetos
  const addProject = () => {
    if (newProject.clientName && newProject.projectName && newProject.stage && newProject.projectType) {
      const projectId = Date.now().toString()
      
      const templateTasks = applyStageTemplates(
        projectId, 
        newProject.startDate || new Date().toISOString().split('T')[0]
      )

      const tasksWithClientName = templateTasks.map(task => ({
        ...task,
        clientName: newProject.clientName || ''
      }))

      const project: Project = {
        id: projectId,
        clientId: newProject.clientId || '',
        clientName: newProject.clientName,
        projectName: newProject.projectName,
        projectType: newProject.projectType,
        stage: newProject.stage,
        startDate: newProject.startDate || new Date().toISOString().split('T')[0],
        deadline: newProject.deadline || '',
        budget: newProject.budget || '',
        description: newProject.description || '',
        priority: newProject.priority as 'low' | 'medium' | 'high' || 'medium',
        tasks: tasksWithClientName,
        templateId: newProject.projectType
      }
      
      setProjects([...projects, project])
      setNewProject({})
      setIsProjectModalOpen(false)
      return project
    }
    return null
  }

  const moveProject = (projectId: string, newStage: string) => {
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === projectId ? { ...p, stage: newStage } : p
      )
    )
    
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(prev => prev ? { ...prev, stage: newStage } : null)
    }
  }

  // Funções de Drag and Drop para projetos
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.stopPropagation()
    setDraggedProject(projectId)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', projectId)
    
    const target = e.target as HTMLElement
    target.style.opacity = '0.6'
    target.style.transform = 'rotate(2deg)'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation()
    setDraggedProject(null)
    setDragOverStage(null)
    setIsDragging(false)
    
    const target = e.target as HTMLElement
    target.style.opacity = '1'
    target.style.transform = 'none'
  }

  const handleDragOver = (e: React.DragEvent, stageName: string) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageName)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverStage(null)
    }
  }

  const handleDrop = (e: React.DragEvent, stageName: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const projectId = e.dataTransfer.getData('text/plain')
    
    if (projectId && draggedProject === projectId) {
      const currentProject = projects.find(p => p.id === projectId)
      
      if (currentProject && currentProject.stage !== stageName) {
        moveProject(projectId, stageName)
      }
    }
    
    setDraggedProject(null)
    setDragOverStage(null)
    setIsDragging(false)
  }

  // Funções para gerenciar etapas (apenas admin)
  const toggleStageManagement = () => {
    if (currentUser.role !== 'admin') return
    setIsManagingStages(!isManagingStages)
    setEditingStageId(null)
    setEditingStageValue('')
  }

  const startEditingStage = (stageId: string, currentName: string) => {
    if (currentUser.role !== 'admin') return
    setEditingStageId(stageId)
    setEditingStageValue(currentName)
  }

  const saveStageEdit = () => {
    if (currentUser.role !== 'admin') return
    if (editingStageId && editingStageValue.trim()) {
      const oldStageName = stages.find(s => s.id === editingStageId)?.name
      
      setStages(stages.map(stage => 
        stage.id === editingStageId 
          ? { ...stage, name: editingStageValue.trim() }
          : stage
      ))
      
      if (oldStageName) {
        setProjects(projects.map(project => 
          project.stage === oldStageName 
            ? { ...project, stage: editingStageValue.trim() }
            : project
        ))
      }
    }
    setEditingStageId(null)
    setEditingStageValue('')
  }

  const cancelStageEdit = () => {
    setEditingStageId(null)
    setEditingStageValue('')
  }

  // Funções de Drag and Drop para etapas (apenas admin)
  const handleStageDragStart = (e: React.DragEvent, stageId: string) => {
    if (currentUser.role !== 'admin') return
    e.stopPropagation()
    setDraggedStage(stageId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', stageId)
  }

  const handleStageDragEnd = (e: React.DragEvent) => {
    e.stopPropagation()
    setDraggedStage(null)
    setDragOverStageIndex(null)
  }

  const handleStageDragOver = (e: React.DragEvent, index: number) => {
    if (currentUser.role !== 'admin') return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStageIndex(index)
  }

  const handleStageDrop = (e: React.DragEvent, dropIndex: number) => {
    if (currentUser.role !== 'admin') return
    e.preventDefault()
    e.stopPropagation()
    
    const stageId = e.dataTransfer.getData('text/plain')
    
    if (stageId && draggedStage === stageId) {
      const dragIndex = stages.findIndex(s => s.id === stageId)
      
      if (dragIndex !== -1 && dragIndex !== dropIndex) {
        const newStages = [...stages]
        const [draggedItem] = newStages.splice(dragIndex, 1)
        newStages.splice(dropIndex, 0, draggedItem)
        setStages(newStages)
      }
    }
    
    setDraggedStage(null)
    setDragOverStageIndex(null)
  }

  // Funções para gerenciar tarefas
  const addTask = () => {
    if (selectedProject && newTask.name) {
      const task: Task = {
        id: Date.now().toString(),
        name: newTask.name,
        description: newTask.description || '',
        responsible: newTask.responsible || '',
        status: newTask.status as 'pending' | 'in-progress' | 'completed' | 'blocked' || 'pending',
        deadline: newTask.deadline || '',
        priority: newTask.priority as 'low' | 'medium' | 'high' || 'medium',
        projectId: selectedProject.id,
        clientName: selectedProject.clientName,
        dependencies: newTask.dependencies || [],
        estimatedDays: newTask.estimatedDays || 1,
        normativeRequirements: newTask.normativeRequirements,
        technicalSteps: newTask.technicalSteps,
        points: newTask.points || 10
      }
      
      const updatedProjects = projects.map(p => 
        p.id === selectedProject.id 
          ? { ...p, tasks: [...p.tasks, task] }
          : p
      )
      setProjects(updatedProjects)
      setSelectedProject({ ...selectedProject, tasks: [...selectedProject.tasks, task] })
      setNewTask({})
      setIsTaskModalOpen(false)
    }
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    if (selectedProject) {
      const updatedTasks = selectedProject.tasks.map(t => 
        t.id === taskId ? { ...t, ...updates } : t
      )
      const updatedProject = { ...selectedProject, tasks: updatedTasks }
      setSelectedProject(updatedProject)
      setProjects(projects.map(p => 
        p.id === selectedProject.id ? updatedProject : p
      ))

      if (updates.status === 'completed') {
        checkAndUnblockTasks(taskId, selectedProject.id)
      }
    }
  }

  const deleteTask = (taskId: string) => {
    if (selectedProject) {
      const updatedTasks = selectedProject.tasks.filter(t => t.id !== taskId)
      const updatedProject = { ...selectedProject, tasks: updatedTasks }
      setSelectedProject(updatedProject)
      setProjects(projects.map(p => 
        p.id === selectedProject.id ? updatedProject : p
      ))
    }
  }

  // Funções para gerenciamento de tarefas por data
  const getAllTasks = (): Task[] => {
    return projects.flatMap(project => project.tasks)
  }

  const getTasksByDeadline = () => {
    const allTasks = getAllTasks()
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    return {
      overdue: allTasks.filter(task => {
        if (!task.deadline) return false
        const deadline = new Date(task.deadline)
        return deadline < today && task.status !== 'completed'
      }),
      today: allTasks.filter(task => {
        if (!task.deadline) return false
        const deadline = new Date(task.deadline)
        return deadline.toDateString() === today.toDateString()
      }),
      tomorrow: allTasks.filter(task => {
        if (!task.deadline) return false
        const deadline = new Date(task.deadline)
        return deadline.toDateString() === tomorrow.toDateString()
      }),
      thisWeek: allTasks.filter(task => {
        if (!task.deadline) return false
        const deadline = new Date(task.deadline)
        return deadline > tomorrow && deadline <= nextWeek
      }),
      later: allTasks.filter(task => {
        if (!task.deadline) return false
        const deadline = new Date(task.deadline)
        return deadline > nextWeek
      }),
      noDeadline: allTasks.filter(task => !task.deadline)
    }
  }

  // Funções de drag and drop para tarefas - CORRIGIDAS
  const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
    e.stopPropagation()
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', taskId)
    
    // Adicionar efeito visual
    const target = e.target as HTMLElement
    target.style.opacity = '0.6'
    target.style.transform = 'rotate(2deg)'
  }

  const handleTaskDragEnd = (e: React.DragEvent) => {
    e.stopPropagation()
    setDraggedTask(null)
    setDragOverTaskStage(null)
    
    // Remover efeito visual
    const target = e.target as HTMLElement
    target.style.opacity = '1'
    target.style.transform = 'none'
  }

  const handleTaskDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTaskStage(status)
  }

  const handleTaskDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverTaskStage(null)
    }
  }

  const handleTaskDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const taskId = e.dataTransfer.getData('text/plain')
    
    if (taskId && draggedTask === taskId) {
      // Encontrar a tarefa em todos os projetos
      const allTasks = getAllTasks()
      const task = allTasks.find(t => t.id === taskId)
      
      if (task) {
        // Mapear status das colunas para status de tarefa
        let taskStatus: 'pending' | 'in-progress' | 'completed' | 'blocked'
        
        switch (newStatus) {
          case 'overdue':
          case 'today':
          case 'tomorrow':
          case 'thisWeek':
          case 'later':
          case 'noDeadline':
            taskStatus = 'in-progress' // Tarefas movidas para colunas de prazo ficam em progresso
            break
          default:
            taskStatus = newStatus as 'pending' | 'in-progress' | 'completed' | 'blocked'
        }
        
        // Atualizar o status da tarefa no projeto correto
        const updatedProjects = projects.map(project => ({
          ...project,
          tasks: project.tasks.map(t => 
            t.id === taskId ? { ...t, status: taskStatus } : t
          )
        }))
        
        setProjects(updatedProjects)

        // Atualizar projeto selecionado se necessário
        if (selectedProject && selectedProject.tasks.some(t => t.id === taskId)) {
          const updatedSelectedProject = {
            ...selectedProject,
            tasks: selectedProject.tasks.map(t => 
              t.id === taskId ? { ...t, status: taskStatus } : t
            )
          }
          setSelectedProject(updatedSelectedProject)
        }

        // Verificar dependências se tarefa foi completada
        if (taskStatus === 'completed') {
          checkAndUnblockTasks(taskId, task.projectId)
        }
      }
    }
    
    setDraggedTask(null)
    setDragOverTaskStage(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in-progress': return <AlertCircle className="w-4 h-4 text-[#FF7F00]" />
      case 'blocked': return <Circle className="w-4 h-4 text-red-500" />
      case 'pending': return <Circle className="w-4 h-4 text-gray-400" />
      default: return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'residential': return <Home className="w-4 h-4" />
      case 'commercial': return <Building className="w-4 h-4" />
      case 'industrial': return <Factory className="w-4 h-4" />
      case 'renovation': return <Wrench className="w-4 h-4" />
      default: return <Building className="w-4 h-4" />
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

  const getUrgencyColor = (deadline: string) => {
    if (!deadline) return ''
    
    const today = new Date()
    const taskDeadline = new Date(deadline)
    const diffTime = taskDeadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'border-l-red-500 bg-red-50'
    if (diffDays === 0) return 'border-l-[#FF7F00] bg-orange-50'
    if (diffDays === 1) return 'border-l-yellow-500 bg-yellow-50'
    if (diffDays <= 7) return 'border-l-blue-500 bg-blue-50'
    return 'border-l-gray-300'
  }

  // Componente de Barra de Busca OTIMIZADO
  const SearchAndFilters = ({ view }: { view: string }) => {
    const clearFilters = useCallback(() => {
      setSearchTerm('')
      setProjectFilters({ stage: '', priority: '', projectType: '', status: '' })
      setTaskFilters({ status: '', priority: '', responsible: '', deadline: '' })
      setClientFilters({ profession: '', city: '', state: '' })
      setTemplateFilters({ stage: '', priority: '' })
    }, [])

    // Handler otimizado para mudança de busca
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value)
    }, [])

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Barra de Busca Principal */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={`Buscar ${view === 'projects' ? 'projetos' : view === 'tasks' ? 'tarefas' : view === 'clients' ? 'clientes' : 'templates'}...`}
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtros Específicos por Visualização */}
          <div className="flex flex-wrap gap-2">
            {view === 'projects' && (
              <>
                <Select value={projectFilters.stage} onValueChange={(value) => setProjectFilters({...projectFilters, stage: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.name}>{stage.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={projectFilters.priority} onValueChange={(value) => setProjectFilters({...projectFilters, priority: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={projectFilters.projectType} onValueChange={(value) => setProjectFilters({...projectFilters, projectType: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="residential">Residencial</SelectItem>
                    <SelectItem value="commercial">Comercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="renovation">Reforma</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={projectFilters.status} onValueChange={(value) => setProjectFilters({...projectFilters, status: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="not-started">Não Iniciado</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            {view === 'tasks' && (
              <>
                <Select value={taskFilters.status} onValueChange={(value) => setTaskFilters({...taskFilters, status: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="blocked">Bloqueada</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={taskFilters.priority} onValueChange={(value) => setTaskFilters({...taskFilters, priority: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Responsável"
                  value={taskFilters.responsible}
                  onChange={(e) => setTaskFilters({...taskFilters, responsible: e.target.value})}
                  className="w-32"
                />

                <Select value={taskFilters.deadline} onValueChange={(value) => setTaskFilters({...taskFilters, deadline: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="overdue">Atrasadas</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="this-week">Esta Semana</SelectItem>
                    <SelectItem value="no-deadline">Sem Prazo</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            {view === 'clients' && (
              <>
                <Input
                  placeholder="Profissão"
                  value={clientFilters.profession}
                  onChange={(e) => setClientFilters({...clientFilters, profession: e.target.value})}
                  className="w-32"
                />

                <Input
                  placeholder="Cidade"
                  value={clientFilters.city}
                  onChange={(e) => setClientFilters({...clientFilters, city: e.target.value})}
                  className="w-32"
                />

                <Select value={clientFilters.state} onValueChange={(value) => setClientFilters({...clientFilters, state: value})}>
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="SP">SP</SelectItem>
                    <SelectItem value="RJ">RJ</SelectItem>
                    <SelectItem value="MG">MG</SelectItem>
                    <SelectItem value="RS">RS</SelectItem>
                    <SelectItem value="PR">PR</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            {view === 'templates' && (
              <>
                <Select value={templateFilters.stage} onValueChange={(value) => setTemplateFilters({...templateFilters, stage: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {stageTemplates.map(template => (
                      <SelectItem key={template.id} value={template.name}>{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={templateFilters.priority} onValueChange={(value) => setTemplateFilters({...templateFilters, priority: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            {/* Botão Limpar Filtros */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="hover:bg-gray-50"
            >
              <X className="w-3 h-3 mr-1" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Indicador de Filtros Ativos */}
        {(searchTerm || 
          Object.values(projectFilters).some(v => v !== '' && v !== 'all') || 
          Object.values(taskFilters).some(v => v !== '' && v !== 'all') || 
          Object.values(clientFilters).some(v => v !== '' && v !== 'all') || 
          Object.values(templateFilters).some(v => v !== '' && v !== 'all')) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Filtros ativos:</span>
              {searchTerm && <Badge variant="secondary">Busca: "{searchTerm}"</Badge>}
              {Object.entries(projectFilters).map(([key, value]) => 
                value && value !== 'all' && <Badge key={key} variant="secondary">{key}: {value}</Badge>
              )}
              {Object.entries(taskFilters).map(([key, value]) => 
                value && value !== 'all' && <Badge key={key} variant="secondary">{key}: {value}</Badge>
              )}
              {Object.entries(clientFilters).map(([key, value]) => 
                value && value !== 'all' && <Badge key={key} variant="secondary">{key}: {value}</Badge>
              )}
              {Object.entries(templateFilters).map(([key, value]) => 
                value && value !== 'all' && <Badge key={key} variant="secondary">{key}: {value}</Badge>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Usar useMemo para otimizar os dados filtrados
  const tasksByDeadline = useMemo(() => getTasksByDeadline(), [projects])
  const filteredProjects = useMemo(() => filterProjects(projects), [projects, searchTerm, projectFilters, filterProjects])
  const filteredTasks = useMemo(() => filterTasks(getAllTasks()), [projects, searchTerm, taskFilters, filterTasks])
  const filteredClients = useMemo(() => filterClients(clients), [clients, searchTerm, clientFilters, filterClients])
  const filteredTemplates = useMemo(() => filterTemplates(stageTemplates), [stageTemplates, searchTerm, templateFilters, filterTemplates])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Moderno com Logo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                {/* Logo */}
                <img 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/4d684e30-9d10-41bf-8d48-28c833b9f901.png" 
                  alt="CooArq Logo" 
                  className="h-10 w-auto"
                />
                <div className="h-8 w-px bg-gray-300" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    CooArq
                  </h1>
                  <p className="text-sm text-gray-600">Gestão Inteligente de Projetos</p>
                </div>
              </div>
              
              {/* Navegação entre visualizações */}
              <div className="hidden md:flex bg-gray-100 rounded-xl p-1 ml-8">
                <Button
                  variant={currentView === 'projects' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('projects')}
                  className={`transition-all duration-200 ${
                    currentView === 'projects' 
                      ? 'bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Projetos
                </Button>
                <Button
                  variant={currentView === 'tasks' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('tasks')}
                  className={`transition-all duration-200 ${
                    currentView === 'tasks' 
                      ? 'bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Tarefas
                </Button>
                {/* Aba Templates - Apenas para Administradores */}
                {currentUser.role === 'admin' && (
                  <Button
                    variant={currentView === 'templates' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('templates')}
                    className={`transition-all duration-200 ${
                      currentView === 'templates' 
                        ? 'bg-white shadow-sm text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Templates
                  </Button>
                )}
                {/* Aba Clientes - Para Gerentes e Administradores */}
                {(currentUser.role === 'manager' || currentUser.role === 'admin') && (
                  <Button
                    variant={currentView === 'clients' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('clients')}
                    className={`transition-all duration-200 ${
                      currentView === 'clients' 
                        ? 'bg-white shadow-sm text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Clientes
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Badge do usuário */}
              <Badge variant="outline" className="hidden sm:flex items-center gap-2 px-3 py-1">
                <User className="w-3 h-3" />
                {currentUser.name} ({currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'manager' ? 'Gerente' : 'Usuário'})
              </Badge>

              {/* Botões de ação */}
              {currentView === 'projects' && (
                <>
                  {/* Gerenciar Etapas (apenas admin) */}
                  {currentUser.role === 'admin' && (
                    <Button 
                      variant={isManagingStages ? "default" : "outline"}
                      size="sm"
                      onClick={toggleStageManagement}
                      className={`transition-all duration-200 ${
                        isManagingStages 
                          ? 'bg-[#FF7F00] hover:bg-[#FF6B00] text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {isManagingStages ? 'Finalizar' : 'Gerenciar Etapas'}
                    </Button>
                  )}

                  {/* Botão Principal - Navegar para Nova Página */}
                  <Button 
                    className="bg-gradient-to-r from-[#FF7F00] to-[#FF9500] hover:from-[#FF6B00] hover:to-[#FF8C00] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => router.push('/novo-projeto')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Projeto
                  </Button>
                </>
              )}

              {/* Botões específicos para Clientes */}
              {currentView === 'clients' && (currentUser.role === 'manager' || currentUser.role === 'admin') && (
                <Button 
                  className="bg-gradient-to-r from-[#FF7F00] to-[#FF9500] hover:from-[#FF6B00] hover:to-[#FF8C00] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => setIsClientModalOpen(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Barra de Busca e Filtros */}
        <SearchAndFilters view={currentView} />

        {/* Indicadores de status */}
        {currentView === 'projects' && isManagingStages && currentUser.role === 'admin' && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-orange-800">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Modo de Gerenciamento de Etapas Ativo</span>
            </div>
            <p className="text-orange-600 text-sm mt-1">
              Clique nos nomes das etapas para editá-los ou arraste as colunas para reordená-las.
            </p>
          </div>
        )}

        {currentView === 'projects' && currentUser.role !== 'admin' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Acesso Limitado</span>
            </div>
            <p className="text-yellow-600 text-sm mt-1">
              Apenas administradores podem gerenciar etapas e sua ordem.
            </p>
          </div>
        )}

        {/* Visualização de Clientes - Para Gerentes e Administradores */}
        {currentView === 'clients' && (currentUser.role === 'manager' || currentUser.role === 'admin') && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FF7F00] to-[#FF9500] rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Gerenciamento de Clientes</h2>
                  <p className="text-gray-600">Configure campos do cadastro e gerencie informações dos clientes</p>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">🔧 Configurações Disponíveis</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Configurar quais campos são obrigatórios ou opcionais no cadastro</li>
                  <li>• Visualizar e editar informações completas dos clientes</li>
                  <li>• Gerenciar dados bancários e contatos adicionais</li>
                  <li>• Definir responsáveis por projetos específicos</li>
                  <li>• Histórico completo de projetos por cliente</li>
                </ul>
              </div>
            </div>

            {/* Configuração de Campos */}
            <Card className="border-l-4 border-l-[#FF7F00]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cog className="w-5 h-5" />
                  Configuração de Campos do Cadastro
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Configure quais campos serão obrigatórios ou opcionais no cadastro de novos clientes.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {fieldConfigs.map(config => (
                  <div key={config.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={config.visible}
                        onCheckedChange={(checked) => updateFieldConfig(config.id, { visible: !!checked })}
                      />
                      <Label className="font-medium">{config.label}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-gray-600">Obrigatório:</Label>
                      <Checkbox
                        checked={config.required}
                        onCheckedChange={(checked) => updateFieldConfig(config.id, { required: !!checked })}
                        disabled={!config.visible}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Lista de Clientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map(client => (
                <Card key={client.id} className="border-l-4 border-l-[#FF7F00] hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{client.fullName}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{client.profession}</p>
                      </div>
                      <Badge variant="outline" className="bg-orange-50 text-[#FF7F00] border-orange-200">
                        {projects.filter(p => p.clientId === client.id).length} projeto(s)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📞</span>
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">✉️</span>
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📍</span>
                        <span className="truncate">
                          {client.personalAddress.city}, {client.personalAddress.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📅</span>
                        <span>Cliente desde {client.createdAt}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-orange-50 hover:border-orange-200"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-blue-50 hover:border-blue-200"
                      >
                        <Briefcase className="w-3 h-3 mr-1" />
                        Projetos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mensagem quando não há resultados */}
            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
                <p className="text-gray-600">Tente ajustar os filtros de busca ou adicione um novo cliente.</p>
              </div>
            )}
          </div>
        )}

        {/* Visualização de Templates - Apenas para Administradores */}
        {currentView === 'templates' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FF7F00] to-[#FF9500] rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Modelo de Template: Tarefas e Subtarefas com Pontuação</h2>
                  <p className="text-gray-600">Configure templates de tarefas específicas para cada etapa do projeto</p>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">🔧 Funcionalidades Disponíveis</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Templates organizados por etapas do Kanban (Medição, Briefing, LayOut, etc.)</li>
                  <li>• Tarefas específicas para cada etapa com dependências configuradas</li>
                  <li>• Sistema de pontuação para acompanhar produtividade individual</li>
                  <li>• Requisitos normativos e passos técnicos detalhados</li>
                  <li>• Aplicação automática ao criar novos projetos</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(stageTemplate => (
                <Card key={stageTemplate.id} className="border-l-4 border-l-[#FF7F00] hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{stageTemplate.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{stageTemplate.description}</p>
                      </div>
                      <Badge variant="outline" className="bg-orange-50 text-[#FF7F00] border-orange-200">
                        {stageTemplate.tasks.length} tarefas
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="font-medium text-sm text-gray-900 mb-2">Tarefas da Etapa:</h5>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {stageTemplate.tasks.slice(0, 4).map((task, index) => (
                            <div key={task.id} className="flex items-center gap-2 text-sm">
                              <span className="w-5 h-5 bg-orange-100 text-[#FF7F00] rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <span className="flex-1 text-gray-700">{task.name}</span>
                              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                {task.estimatedDays}d
                              </Badge>
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Star className="w-2 h-2" />
                                {task.points || 0}
                              </Badge>
                            </div>
                          ))}
                          {stageTemplate.tasks.length > 4 && (
                            <div className="text-xs text-gray-500 text-center pt-1">
                              +{stageTemplate.tasks.length - 4} tarefas adicionais
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 hover:bg-orange-50 hover:border-orange-200"
                          onClick={() => {
                            setEditingTemplate(stageTemplate)
                            setIsTemplateModalOpen(true)
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Visualizar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 hover:bg-blue-50 hover:border-blue-200"
                          disabled
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mensagem quando não há resultados */}
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
                <p className="text-gray-600">Tente ajustar os filtros de busca.</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Funcionalidade em Desenvolvimento</span>
              </div>
              <p className="text-sm text-yellow-700">
                A edição completa de templates por etapa estará disponível em breve. Atualmente você pode visualizar os templates existentes organizados por etapas do Kanban e eles são aplicados automaticamente durante a criação de projetos com sistema de pontuação integrado.
              </p>
            </div>
          </div>
        )}

        {/* Visualização de Projetos */}
        {currentView === 'projects' && (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {stages.map((stage, index) => (
              <div 
                key={stage.id} 
                className={`flex-shrink-0 w-80 transition-all duration-200 ${
                  isManagingStages && currentUser.role === 'admin' ? 'cursor-move' : ''
                } ${
                  dragOverStageIndex === index ? 'transform scale-105' : ''
                }`}
                draggable={isManagingStages && currentUser.role === 'admin'}
                onDragStart={isManagingStages && currentUser.role === 'admin' ? (e) => handleStageDragStart(e, stage.id) : undefined}
                onDragEnd={isManagingStages && currentUser.role === 'admin' ? handleStageDragEnd : undefined}
                onDragOver={isManagingStages && currentUser.role === 'admin' ? (e) => handleStageDragOver(e, index) : undefined}
                onDrop={isManagingStages && currentUser.role === 'admin' ? (e) => handleStageDrop(e, index) : undefined}
              >
                <div className={`bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden ${
                  isManagingStages && currentUser.role === 'admin' ? 'ring-2 ring-orange-200 shadow-lg' : ''
                }`}>
                  <div className={`${stage.color} text-white p-4 relative`}>
                    {isManagingStages && currentUser.role === 'admin' && (
                      <div className="absolute top-2 right-2">
                        <GripVertical className="w-5 h-5 opacity-70" />
                      </div>
                    )}
                    
                    {editingStageId === stage.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingStageValue}
                          onChange={(e) => setEditingStageValue(e.target.value)}
                          className="bg-white/20 border-white/30 text-white placeholder-white/70 text-lg font-semibold"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveStageEdit()
                            if (e.key === 'Escape') cancelStageEdit()
                          }}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={saveStageEdit}
                            className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelStageEdit}
                            className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 
                          className={`font-semibold text-lg ${
                            isManagingStages && currentUser.role === 'admin' ? 'cursor-pointer hover:bg-white/10 rounded px-2 py-1 -mx-2 -my-1' : ''
                          }`}
                          onClick={isManagingStages && currentUser.role === 'admin' ? () => startEditingStage(stage.id, stage.name) : undefined}
                        >
                          {stage.name}
                          {isManagingStages && currentUser.role === 'admin' && (
                            <Edit className="w-4 h-4 inline ml-2 opacity-70" />
                          )}
                        </h3>
                        <p className="text-sm opacity-90">
                          {filteredProjects.filter(p => p.stage === stage.name).length} projeto(s)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className={`p-4 space-y-3 min-h-[300px] transition-all duration-200 ${
                      dragOverStage === stage.name 
                        ? 'bg-orange-50 border-2 border-dashed border-orange-300' 
                        : ''
                    } ${
                      isManagingStages && currentUser.role === 'admin' ? 'opacity-75' : ''
                    }`}
                    onDragOver={!isManagingStages ? (e) => handleDragOver(e, stage.name) : undefined}
                    onDragLeave={!isManagingStages ? handleDragLeave : undefined}
                    onDrop={!isManagingStages ? (e) => handleDrop(e, stage.name) : undefined}
                  >
                    {!isManagingStages && filteredProjects
                      .filter(project => project.stage === stage.name)
                      .map(project => (
                        <Card 
                          key={project.id} 
                          className={`cursor-grab hover:cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 border-l-4 border-l-[#FF7F00] hover:border-l-[#FF6B00] ${
                            draggedProject === project.id ? 'opacity-60 transform rotate-2 shadow-xl' : ''
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, project.id)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => {
                            if (!isDragging) {
                              setSelectedProject(project)
                            }
                          }}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getProjectTypeIcon(project.projectType)}
                                  <Badge variant="outline" className="text-xs">
                                    {getProjectTypeName(project.projectType)}
                                  </Badge>
                                </div>
                                <CardTitle className="text-sm font-medium text-gray-900">
                                  {project.clientName}
                                </CardTitle>
                                <p className="text-xs text-gray-600 mt-1 font-medium">
                                  {project.projectName}
                                </p>
                              </div>
                              <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                                {project.priority === 'high' ? 'Alta' : 
                                 project.priority === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {project.deadline}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {project.tasks.length} tarefa(s)
                              </div>
                            </div>
                            
                            {/* Indicador de progresso das tarefas */}
                            {project.tasks.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Progresso</span>
                                  <span className="font-medium">
                                    {project.tasks.filter(t => t.status === 'completed').length}/{project.tasks.length}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-[#FF7F00] to-[#FF9500] h-2 rounded-full transition-all duration-300" 
                                    style={{ 
                                      width: `${(project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                                
                                {/* Status das tarefas */}
                                <div className="flex gap-1 mt-2">
                                  {project.tasks.slice(0, 6).map(task => (
                                    <div 
                                      key={task.id} 
                                      className={`w-2 h-2 rounded-full ${ 
                                        task.status === 'completed' ? 'bg-green-400' :
                                        task.status === 'in-progress' ? 'bg-[#FF7F00]' :
                                        task.status === 'blocked' ? 'bg-red-400' :
                                        'bg-gray-300'
                                      }`}
                                      title={`${task.name} - ${task.status}`}
                                    ></div>
                                  ))}
                                  {project.tasks.length > 6 && (
                                    <span className="text-xs text-gray-400 ml-1">+{project.tasks.length - 6}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    
                    {/* Indicador visual quando arrastar sobre a coluna */}
                    {!isManagingStages && dragOverStage === stage.name && draggedProject && (
                      <div className="border-2 border-dashed border-orange-400 rounded-lg p-6 text-center text-[#FF7F00] bg-orange-50">
                        <div className="text-sm font-medium">Solte aqui para mover o projeto</div>
                        <div className="text-xs opacity-75 mt-1">para a etapa {stage.name}</div>
                      </div>
                    )}

                    {/* Indicador para modo de gerenciamento */}
                    {isManagingStages && currentUser.role === 'admin' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 bg-gray-50">
                        <div className="text-sm">Modo de gerenciamento ativo</div>
                        <div className="text-xs opacity-75 mt-1">Edite o nome ou reordene as etapas</div>
                      </div>
                    )}

                    {/* Mensagem quando não há projetos na etapa */}
                    {!isManagingStages && filteredProjects.filter(p => p.stage === stage.name).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum projeto nesta etapa</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visualização de Tarefas por Data de Vencimento */}
        {currentView === 'tasks' && (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {/* Atrasadas */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4">
                  <h3 className="font-semibold text-lg">Atrasadas</h3>
                  <p className="text-sm opacity-90">{filterTasks(tasksByDeadline.overdue).length} tarefa(s)</p>
                </div>
                <div 
                  className={`p-4 space-y-3 min-h-[300px] transition-all duration-200 ${
                    dragOverTaskStage === 'overdue' ? 'bg-red-50 border-2 border-dashed border-red-300' : ''
                  }`}
                  onDragOver={(e) => handleTaskDragOver(e, 'overdue')}
                  onDragLeave={handleTaskDragLeave}
                  onDrop={(e) => handleTaskDrop(e, 'overdue')}
                >
                  {filterTasks(tasksByDeadline.overdue).map(task => (
                    <Card key={task.id} className={`border-l-4 border-l-red-500 bg-red-50 cursor-grab hover:shadow-lg transition-all duration-200 ${
                      draggedTask === task.id ? 'opacity-60 transform rotate-2 shadow-xl' : ''
                    }`}
                      draggable
                      onDragStart={(e) => handleTaskDragStart(e, task.id)}
                      onDragEnd={handleTaskDragEnd}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2 flex-1">
                            {getStatusIcon(task.status)}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{task.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{task.clientName}</p>
                              {task.dependencies.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Link className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {task.dependencies.length} dependência(s)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                            {task.points && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Star className="w-2 h-2" />
                                {task.points}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.deadline}
                          </div>
                          {task.responsible && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.responsible}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Indicador visual quando arrastar sobre a coluna */}
                  {dragOverTaskStage === 'overdue' && draggedTask && (
                    <div className="border-2 border-dashed border-red-400 rounded-lg p-6 text-center text-red-600 bg-red-50">
                      <div className="text-sm font-medium">Solte aqui para mover a tarefa</div>
                      <div className="text-xs opacity-75 mt-1">para Atrasadas</div>
                    </div>
                  )}

                  {/* Mensagem quando não há tarefas */}
                  {filterTasks(tasksByDeadline.overdue).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma tarefa atrasada</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hoje */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-[#FF7F00] to-[#FF9500] text-white p-4">
                  <h3 className="font-semibold text-lg">Hoje</h3>
                  <p className="text-sm opacity-90">{filterTasks(tasksByDeadline.today).length} tarefa(s)</p>
                </div>
                <div 
                  className={`p-4 space-y-3 min-h-[300px] transition-all duration-200 ${
                    dragOverTaskStage === 'today' ? 'bg-orange-50 border-2 border-dashed border-orange-300' : ''
                  }`}
                  onDragOver={(e) => handleTaskDragOver(e, 'today')}
                  onDragLeave={handleTaskDragLeave}
                  onDrop={(e) => handleTaskDrop(e, 'today')}
                >
                  {filterTasks(tasksByDeadline.today).map(task => (
                    <Card key={task.id} className={`border-l-4 border-l-[#FF7F00] bg-orange-50 cursor-grab hover:shadow-lg transition-all duration-200 ${
                      draggedTask === task.id ? 'opacity-60 transform rotate-2 shadow-xl' : ''
                    }`}
                      draggable
                      onDragStart={(e) => handleTaskDragStart(e, task.id)}
                      onDragEnd={handleTaskDragEnd}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2 flex-1">
                            {getStatusIcon(task.status)}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{task.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{task.clientName}</p>
                              {task.dependencies.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Link className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {task.dependencies.length} dependência(s)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                            {task.points && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Star className="w-2 h-2" />
                                {task.points}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.deadline}
                          </div>
                          {task.responsible && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.responsible}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Indicador visual quando arrastar sobre a coluna */}
                  {dragOverTaskStage === 'today' && draggedTask && (
                    <div className="border-2 border-dashed border-orange-400 rounded-lg p-6 text-center text-[#FF7F00] bg-orange-50">
                      <div className="text-sm font-medium">Solte aqui para mover a tarefa</div>
                      <div className="text-xs opacity-75 mt-1">para Hoje</div>
                    </div>
                  )}

                  {/* Mensagem quando não há tarefas */}
                  {filterTasks(tasksByDeadline.today).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma tarefa para hoje</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amanhã */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4">
                  <h3 className="font-semibold text-lg">Amanhã</h3>
                  <p className="text-sm opacity-90">{filterTasks(tasksByDeadline.tomorrow).length} tarefa(s)</p>
                </div>
                <div 
                  className={`p-4 space-y-3 min-h-[300px] transition-all duration-200 ${
                    dragOverTaskStage === 'tomorrow' ? 'bg-yellow-50 border-2 border-dashed border-yellow-300' : ''
                  }`}
                  onDragOver={(e) => handleTaskDragOver(e, 'tomorrow')}
                  onDragLeave={handleTaskDragLeave}
                  onDrop={(e) => handleTaskDrop(e, 'tomorrow')}
                >
                  {filterTasks(tasksByDeadline.tomorrow).map(task => (
                    <Card key={task.id} className={`border-l-4 border-l-yellow-500 bg-yellow-50 cursor-grab hover:shadow-lg transition-all duration-200 ${
                      draggedTask === task.id ? 'opacity-60 transform rotate-2 shadow-xl' : ''
                    }`}
                      draggable
                      onDragStart={(e) => handleTaskDragStart(e, task.id)}
                      onDragEnd={handleTaskDragEnd}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2 flex-1">
                            {getStatusIcon(task.status)}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{task.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{task.clientName}</p>
                              {task.dependencies.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Link className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {task.dependencies.length} dependência(s)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                            {task.points && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Star className="w-2 h-2" />
                                {task.points}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.deadline}
                          </div>
                          {task.responsible && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.responsible}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Indicador visual quando arrastar sobre a coluna */}
                  {dragOverTaskStage === 'tomorrow' && draggedTask && (
                    <div className="border-2 border-dashed border-yellow-400 rounded-lg p-6 text-center text-yellow-600 bg-yellow-50">
                      <div className="text-sm font-medium">Solte aqui para mover a tarefa</div>
                      <div className="text-xs opacity-75 mt-1">para Amanhã</div>
                    </div>
                  )}

                  {/* Mensagem quando não há tarefas */}
                  {filterTasks(tasksByDeadline.tomorrow).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma tarefa para amanhã</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Esta Semana */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                  <h3 className="font-semibold text-lg">Esta Semana</h3>
                  <p className="text-sm opacity-90">{filterTasks(tasksByDeadline.thisWeek).length} tarefa(s)</p>
                </div>
                <div 
                  className={`p-4 space-y-3 min-h-[300px] transition-all duration-200 ${
                    dragOverTaskStage === 'thisWeek' ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
                  }`}
                  onDragOver={(e) => handleTaskDragOver(e, 'thisWeek')}
                  onDragLeave={handleTaskDragLeave}
                  onDrop={(e) => handleTaskDrop(e, 'thisWeek')}
                >
                  {filterTasks(tasksByDeadline.thisWeek).map(task => (
                    <Card key={task.id} className={`border-l-4 border-l-blue-500 bg-blue-50 cursor-grab hover:shadow-lg transition-all duration-200 ${
                      draggedTask === task.id ? 'opacity-60 transform rotate-2 shadow-xl' : ''
                    }`}
                      draggable
                      onDragStart={(e) => handleTaskDragStart(e, task.id)}
                      onDragEnd={handleTaskDragEnd}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2 flex-1">
                            {getStatusIcon(task.status)}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{task.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{task.clientName}</p>
                              {task.dependencies.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Link className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {task.dependencies.length} dependência(s)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                            {task.points && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Star className="w-2 h-2" />
                                {task.points}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.deadline}
                          </div>
                          {task.responsible && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.responsible}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Indicador visual quando arrastar sobre a coluna */}
                  {dragOverTaskStage === 'thisWeek' && draggedTask && (
                    <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center text-blue-600 bg-blue-50">
                      <div className="text-sm font-medium">Solte aqui para mover a tarefa</div>
                      <div className="text-xs opacity-75 mt-1">para Esta Semana</div>
                    </div>
                  )}

                  {/* Mensagem quando não há tarefas */}
                  {filterTasks(tasksByDeadline.thisWeek).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma tarefa esta semana</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mais Tarde */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
                  <h3 className="font-semibold text-lg">Mais Tarde</h3>
                  <p className="text-sm opacity-90">{filterTasks(tasksByDeadline.later).length} tarefa(s)</p>
                </div>
                <div 
                  className={`p-4 space-y-3 min-h-[300px] transition-all duration-200 ${
                    dragOverTaskStage === 'later' ? 'bg-green-50 border-2 border-dashed border-green-300' : ''
                  }`}
                  onDragOver={(e) => handleTaskDragOver(e, 'later')}
                  onDragLeave={handleTaskDragLeave}
                  onDrop={(e) => handleTaskDrop(e, 'later')}
                >
                  {filterTasks(tasksByDeadline.later).map(task => (
                    <Card key={task.id} className={`border-l-4 border-l-green-500 cursor-grab hover:shadow-lg transition-all duration-200 ${
                      draggedTask === task.id ? 'opacity-60 transform rotate-2 shadow-xl' : ''
                    }`}
                      draggable
                      onDragStart={(e) => handleTaskDragStart(e, task.id)}
                      onDragEnd={handleTaskDragEnd}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2 flex-1">
                            {getStatusIcon(task.status)}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{task.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{task.clientName}</p>
                              {task.dependencies.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Link className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {task.dependencies.length} dependência(s)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                            {task.points && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Star className="w-2 h-2" />
                                {task.points}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.deadline}
                          </div>
                          {task.responsible && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.responsible}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Indicador visual quando arrastar sobre a coluna */}
                  {dragOverTaskStage === 'later' && draggedTask && (
                    <div className="border-2 border-dashed border-green-400 rounded-lg p-6 text-center text-green-600 bg-green-50">
                      <div className="text-sm font-medium">Solte aqui para mover a tarefa</div>
                      <div className="text-xs opacity-75 mt-1">para Mais Tarde</div>
                    </div>
                  )}

                  {/* Mensagem quando não há tarefas */}
                  {filterTasks(tasksByDeadline.later).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma tarefa futura</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sem Prazo */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4">
                  <h3 className="font-semibold text-lg">Sem Prazo</h3>
                  <p className="text-sm opacity-90">{filterTasks(tasksByDeadline.noDeadline).length} tarefa(s)</p>
                </div>
                <div 
                  className={`p-4 space-y-3 min-h-[300px] transition-all duration-200 ${
                    dragOverTaskStage === 'noDeadline' ? 'bg-gray-50 border-2 border-dashed border-gray-300' : ''
                  }`}
                  onDragOver={(e) => handleTaskDragOver(e, 'noDeadline')}
                  onDragLeave={handleTaskDragLeave}
                  onDrop={(e) => handleTaskDrop(e, 'noDeadline')}
                >
                  {filterTasks(tasksByDeadline.noDeadline).map(task => (
                    <Card key={task.id} className={`border-l-4 border-l-gray-300 cursor-grab hover:shadow-lg transition-all duration-200 ${
                      draggedTask === task.id ? 'opacity-60 transform rotate-2 shadow-xl' : ''
                    }`}
                      draggable
                      onDragStart={(e) => handleTaskDragStart(e, task.id)}
                      onDragEnd={handleTaskDragEnd}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2 flex-1">
                            {getStatusIcon(task.status)}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{task.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{task.clientName}</p>
                              {task.dependencies.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Link className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {task.dependencies.length} dependência(s)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                            {task.points && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Star className="w-2 h-2" />
                                {task.points}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Sem prazo
                          </div>
                          {task.responsible && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.responsible}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Indicador visual quando arrastar sobre a coluna */}
                  {dragOverTaskStage === 'noDeadline' && draggedTask && (
                    <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center text-gray-600 bg-gray-50">
                      <div className="text-sm font-medium">Solte aqui para mover a tarefa</div>
                      <div className="text-xs opacity-75 mt-1">para Sem Prazo</div>
                    </div>
                  )}

                  {/* Mensagem quando não há tarefas */}
                  {filterTasks(tasksByDeadline.noDeadline).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma tarefa sem prazo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Projeto */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Projeto</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getProjectTypeIcon(selectedProject.projectType)}
                    <Badge variant="outline">
                      {getProjectTypeName(selectedProject.projectType)}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold">{selectedProject.clientName}</h2>
                  <p className="text-gray-600 mt-1">{selectedProject.projectName}</p>
                </div>
                <Badge className={`${getPriorityColor(selectedProject.priority)}`}>
                  {selectedProject.priority === 'high' ? 'Alta Prioridade' : 
                   selectedProject.priority === 'medium' ? 'Média Prioridade' : 'Baixa Prioridade'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Informações do Projeto */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informações do Projeto</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Etapa Atual:</span>
                      <Badge variant="outline">{selectedProject.stage}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Data de Início:</span>
                      <span className="text-sm">{selectedProject.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Prazo Final:</span>
                      <span className="text-sm">{selectedProject.deadline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Orçamento:</span>
                      <span className="text-sm font-medium">{selectedProject.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Progresso:</span>
                      <span className="text-sm font-medium">
                        {selectedProject.tasks.filter(t => t.status === 'completed').length}/{selectedProject.tasks.length} tarefas
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pontuação Total:</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {selectedProject.tasks.reduce((sum, task) => sum + (task.points || 0), 0)} pontos
                      </span>
                    </div>
                  </div>
                  
                  {selectedProject.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Descrição</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedProject.description}
                      </p>
                    </div>
                  )}

                  {/* Mover Projeto */}
                  <div>
                    <Label htmlFor="moveStage">Mover para Etapa</Label>
                    <Select onValueChange={(value) => moveProject(selectedProject.id, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedProject.stage} />
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
                </div>

                {/* Tarefas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Tarefas ({selectedProject.tasks.length})
                    </h3>
                    <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="flex items-center gap-1 bg-[#FF7F00] hover:bg-[#FF6B00]">
                          <Plus className="w-3 h-3" />
                          Nova Tarefa
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="taskName">Nome da Tarefa</Label>
                            <Input
                              id="taskName"
                              value={newTask.name || ''}
                              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                              placeholder="Nome da tarefa"
                            />
                          </div>
                          <div>
                            <Label htmlFor="taskDescription">Descrição</Label>
                            <Textarea
                              id="taskDescription"
                              value={newTask.description || ''}
                              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                              placeholder="Descrição da tarefa"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="taskResponsible">Responsável</Label>
                              <Input
                                id="taskResponsible"
                                value={newTask.responsible || ''}
                                onChange={(e) => setNewTask({ ...newTask, responsible: e.target.value })}
                                placeholder="Nome do responsável"
                              />
                            </div>
                            <div>
                              <Label htmlFor="taskDeadline">Prazo</Label>
                              <Input
                                id="taskDeadline"
                                type="date"
                                value={newTask.deadline || ''}
                                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="taskStatus">Status</Label>
                              <Select onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendente</SelectItem>
                                  <SelectItem value="in-progress">Em Andamento</SelectItem>
                                  <SelectItem value="completed">Concluída</SelectItem>
                                  <SelectItem value="blocked">Bloqueada</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="taskPriority">Prioridade</Label>
                              <Select onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a prioridade" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Baixa</SelectItem>
                                  <SelectItem value="medium">Média</SelectItem>
                                  <SelectItem value="high">Alta</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="estimatedDays">Dias Estimados</Label>
                              <Input
                                id="estimatedDays"
                                type="number"
                                value={newTask.estimatedDays || ''}
                                onChange={(e) => setNewTask({ ...newTask, estimatedDays: parseInt(e.target.value) || 1 })}
                                placeholder="1"
                                min="1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="taskPoints">Pontuação</Label>
                              <Input
                                id="taskPoints"
                                type="number"
                                value={newTask.points || ''}
                                onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) || 10 })}
                                placeholder="10"
                                min="0"
                              />
                            </div>
                          </div>
                          <Button onClick={addTask} className="w-full bg-[#FF7F00] hover:bg-[#FF6B00]">
                            {editingTask ? 'Atualizar Tarefa' : 'Criar Tarefa'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedProject.tasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma tarefa criada ainda</p>
                      </div>
                    ) : (
                      selectedProject.tasks.map(task => (
                        <Card key={task.id} className={`border-l-4 border-l-[#FF7F00] ${getUrgencyColor(task.deadline)}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-start gap-2 flex-1">
                                {getStatusIcon(task.status)}
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{task.name}</h4>
                                  {task.description && (
                                    <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                                  )}
                                  {task.dependencies.length > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Link className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">
                                        {task.dependencies.length} dependência(s)
                                      </span>
                                    </div>
                                  )}
                                  {task.normativeRequirements && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      📋 {task.normativeRequirements}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem 
                                    onClick={() => updateTask(task.id, { 
                                      status: task.status === 'completed' ? 'pending' : 'completed' 
                                    })}
                                  >
                                    {task.status === 'completed' ? 'Marcar como Pendente' : 'Marcar como Concluída'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => deleteTask(task.id)} 
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-3">
                                {task.responsible && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {task.responsible}
                                  </div>
                                )}
                                {task.deadline && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {task.deadline}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {task.estimatedDays}d
                                </div>
                                {task.points && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    {task.points}pts
                                  </div>
                                )}
                              </div>
                              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority === 'high' ? 'Alta' : 
                                 task.priority === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Cadastro de Cliente */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Nome Completo *</Label>
                  <Input
                    id="clientName"
                    value={newClient.fullName || ''}
                    onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
                    placeholder="Nome completo do cliente"
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Telefone/WhatsApp *</Label>
                  <Input
                    id="clientPhone"
                    value={newClient.phone || ''}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">E-mail *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={newClient.email || ''}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="cliente@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="clientDocument">CPF/CNPJ</Label>
                  <Input
                    id="clientDocument"
                    value={newClient.document || ''}
                    onChange={(e) => setNewClient({ ...newClient, document: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            </div>

            {/* Endereço Pessoal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Endereço Pessoal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="personalStreet">Rua/Avenida</Label>
                  <Input
                    id="personalStreet"
                    value={newClient.personalAddress?.street || ''}
                    onChange={(e) => setNewClient({ 
                      ...newClient, 
                      personalAddress: { ...newClient.personalAddress, street: e.target.value } 
                    })}
                    placeholder="Nome da rua"
                  />
                </div>
                <div>
                  <Label htmlFor="personalNumber">Número</Label>
                  <Input
                    id="personalNumber"
                    value={newClient.personalAddress?.number || ''}
                    onChange={(e) => setNewClient({ 
                      ...newClient, 
                      personalAddress: { ...newClient.personalAddress, number: e.target.value } 
                    })}
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={addClient} 
                className="flex-1 bg-[#FF7F00] hover:bg-[#FF6B00]"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar Cliente
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsClientModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Template */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Template da Etapa: {editingTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ Funcionalidade em Desenvolvimento</h4>
                  <p className="text-sm text-yellow-700">
                    A personalização completa de templates por etapa estará disponível em breve. 
                    Por enquanto, você pode visualizar as tarefas padrão que serão aplicadas automaticamente para esta etapa, incluindo o sistema de pontuação.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Tarefas da Etapa {editingTemplate.name}:</h4>
                  {editingTemplate.tasks.map((task, index) => (
                    <Card key={task.id} className="border-l-4 border-l-[#FF7F00]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="w-8 h-8 bg-orange-100 text-[#FF7F00] rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{task.name}</h5>
                              <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                              {task.normativeRequirements && (
                                <p className="text-xs text-blue-600 mt-1">
                                  📋 {task.normativeRequirements}
                                </p>
                              )}
                              {task.dependencies.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Link className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    Depende de: {task.dependencies.join(', ')}
                                  </span>
                                </div>
                              )}
                              {task.technicalSteps && task.technicalSteps.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-700">Passos técnicos:</p>
                                  <ul className="text-xs text-gray-600 ml-2">
                                    {task.technicalSteps.map((step, stepIndex) => (
                                      <li key={stepIndex}>• {step}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.estimatedDays}d
                            </Badge>
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Star className="w-2 h-2" />
                              {task.points || 0}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rodapé com Logo */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/4d684e30-9d10-41bf-8d48-28c833b9f901.png" 
                alt="CooArq Logo" 
                className="h-8 w-auto"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">CooArq</p>
                <p className="text-xs text-gray-600">Gestão Inteligente de Projetos</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              © 2024 CooArq. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}