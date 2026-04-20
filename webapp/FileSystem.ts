/**
 * Sistema de persistência e gerenciamento de arquivos para a webapp.
 * Lida com o armazenamento local (localStorage) e a extração de código a partir da URL.
 */
import { Observable } from './Observable'
import { Route } from './Route'

/** Representa um metadado de arquivo salvo */
export interface FileEntry {
  name: string
  date: string
  backingStore: StoreKind
}

/** 
 * Orquestrador do sistema de arquivos. 
 * Gerencia o arquivo ativo e alterna entre diferentes estratégias de armazenamento.
 */
export class FileSystem {
  signals: Observable = new Observable()
  activeFile: FileEntry = { name: '', date: '1970-01-01', backingStore: 'url' }
  storage: GraphStore = new StoreDefaultBuffer()

  finishedInsertingFiles() {
    this.signals.trigger('updated')
  }

  /** Cria um novo arquivo no armazenamento local */
  async moveToFileStorage(name: string, source: string) {
    var fileStore = new StoreLocal(name)
    fileStore.insert(source)
    this.signals.trigger('updated')
  }

  /** Define o buffer padrão do localStorage como destino das gravações */
  async moveToLocalStorage(source: string): Promise<void> {
    this.storage = new StoreDefaultBuffer()
    await this.storage.save(source)
  }

  /** Apaga um arquivo do armazenamento local */
  async discard(entry: FileEntry): Promise<void> {
    var fileStore = new StoreLocal(entry.name)
    await fileStore.clear()
    this.signals.trigger('updated')
  }

  /** Altera a estratégia de armazenamento baseando-se na rota/hash da URL atual */
  async configureByRoute(path: string) {
    var route = Route.from(path)
    this.storage = this.routedStorage(route)
    var index = await this.storage.files()
    this.activeFile =
      index.find((e) => e.name === route.path) ?? fileEntry(route.path, 'local_file')
    this.signals.trigger('updated')
  }

  /** Fábrica de estratégias de armazenamento (Padrão Strategy) */
  routedStorage(route: Route): GraphStore {
    if (route.context === 'view') {
      return new StoreUrl(decodeURIComponent(route.path))
    }
    if (route.context === 'file') {
      return new StoreLocal(route.path)
    }
    return new StoreDefaultBuffer()
  }
}

type StoreKind = 'local_default' | 'local_file' | 'filesystem' | 'url'

function fileEntry(name: string, backingStore: StoreKind): FileEntry {
  return { date: new Date().toISOString(), name, backingStore }
}

/** Interface comum para persistência de dados */
interface GraphStore {
  files(): Promise<FileEntry[]>
  read(): Promise<string | undefined>
  insert(src: string): Promise<void>
  save(src: string): Promise<void>
  clear(): Promise<void>
  kind: StoreKind
}

/** Armazenamento padrão que guarda o último trabalho não salvo no localStorage */
export class StoreDefaultBuffer implements GraphStore {
  kind: StoreKind = 'local_default'
  storageKey: string = 'nomnoml.lastSource'
  async files(): Promise<FileEntry[]> {
    return JSON.parse(localStorage['nomnoml.file_index'] || '[]') as FileEntry[]
  }
  async read(): Promise<string | undefined> {
    return localStorage[this.storageKey]
  }
  async insert(source: string): Promise<void> {}
  async save(source: string): Promise<void> {
    localStorage[this.storageKey] = source
  }
  async clear(): Promise<void> {}
}

/** "Armazenamento" somente leitura que extrai o código diretamente da URL */
export class StoreUrl implements GraphStore {
  kind: StoreKind = 'url'
  constructor(private source: string) {}
  async files(): Promise<FileEntry[]> {
    return JSON.parse(localStorage['nomnoml.file_index'] || '[]') as FileEntry[]
  }
  async read(): Promise<string | undefined> {
    return this.source
  }
  async insert(source: string): Promise<void> {}
  async save(source: string): Promise<void> {}
  async clear(): Promise<void> {}
}

/** Armazenamento de arquivos nomeados salvos pelo usuário no localStorage */
export class StoreLocal implements GraphStore {
  kind: StoreKind = 'local_file'
  storageKey: string
  constructor(public name: string) {
    this.storageKey = 'nomnoml.files/' + name
  }
  async files(): Promise<FileEntry[]> {
    return JSON.parse(localStorage['nomnoml.file_index'] || '[]') as FileEntry[]
  }
  async read(): Promise<string | undefined> {
    return localStorage[this.storageKey]
  }
  async insert(source: string): Promise<void> {
    var entry: FileEntry = fileEntry(this.name, 'local_file')
    var index = await this.files()
    if (!index.find((e) => e.name === this.name)) {
      index.push(entry)
      index.sort((a, b) => a.name.localeCompare(b.name))
      localStorage['nomnoml.file_index'] = JSON.stringify(index)
    }
    localStorage[this.storageKey] = source
  }
  async save(source: string): Promise<void> {
    localStorage[this.storageKey] = source
  }
  async clear(): Promise<void> {
    localStorage.removeItem(this.storageKey)
    var files = await this.files()
    var index = files.filter((e) => e.name != this.name)
    localStorage['nomnoml.file_index'] = JSON.stringify(index)
  }
}
