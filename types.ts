
export interface Op {
  id: number;
  desc: string;
  prio: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELED';
}

export interface Boat {
  id: number;
  nome: string;
  arrival: string;
  tipo: 'OPERANDO' | 'STAND BY' | 'DEPARTED' | 'OUTRO';
  local: string;
  orientation?: 'BOW TO BOW' | 'BOW TO STERN';
  hora: string;
  departureTime?: string;
  destination?: string;
  eta?: string;
  ops: Op[];
  activeOpId: number | null;
}

export interface AcousticTransponder {
  id: number;
  name: string; // Identificação (ex: M45)
  val: number; // Battery level 0-100
  channelM?: string;
  channelB?: string;
  serial?: string;
  floatId?: string; // Nome do flutuador
}

export interface AcousticSystem {
  id: number;
  type: 'LBL' | 'SSBL' | 'OUTROS';
  name: string; // Nome do sistema (ex: "LBL 1" ou "Beacon 1")
  transponders: AcousticTransponder[];
}

export interface Tag {
  id: number;
  text: string;
  color: 'red' | 'yellow' | 'blue' | 'green';
  img?: string;
  active: boolean;
}

export interface Flight {
  id: number;
  prefix: string;
  info: string;
  etd: string;
  eta: string;
  status: 'ON TIME' | 'DELAYED' | 'ARRIVED' | 'CANCELED';
}

export interface User {
  username: string;
  passwordHash: string;
}

export interface AppData {
  wellName: string;
  arrivalDate: string;
  lat: string;
  long: string;
  utm: string;
  depth: string;
  routeStatus: string;
  routeMsg: string;
  routeImgBase64: string;
  logoImgBase64: string;
  weatherImgBase64: string;
  weatherTitle: string;
  illegalSector: string;
  rigHeading: string;
  bopHeading: string;
  edsUpdate: string;
  yellowM: string;
  yellowTime: string;
  redM: string;
  redTime: string;
  kposTime: string;
  riserTime: string;
  eds1: string;
  eds2: string;
  eds3: string;
  eds4: string;
  eds5: string;
  eds1Visible: boolean;
  eds2Visible: boolean;
  eds3Visible: boolean;
  eds4Visible: boolean;
  eds5Visible: boolean;
  cargoExplosive: string;
  cargoRadio: string;
  cargoNote: string;
  engUnav: string;
  thrUnav: string;
  equipRemarks: string;
  listaBarcos: Boat[];
  acousticSystems: AcousticSystem[]; // Renamed from transpondersList
  flightsList: Flight[];
  statusTags: Tag[];
  timestamp: number;
  pocoNome?: string;
  pocoCoordenadas?: string;
  pocoRota?: string;
  edsStatus?: string;
  latchStatus?: string;
  equipTipo?: string;
  equipQtd?: number;
  equipObs?: string;
  acousticSystem?: string;
  acousticFreq?: string;
  acousticObs?: string;
  weatherStatus?: string;
  flightStatus?: string;
  weatherObs?: string;
  tags?: string;
}

export const INITIAL_DATA: AppData = {
  wellName: '7-BR-86DB-RJS',
  arrivalDate: '',
  lat: '',
  long: '',
  utm: '',
  depth: '',
  routeStatus: 'ROTA DESIMPEDIDA',
  routeMsg: '',
  routeImgBase64: '',
  logoImgBase64: '',
  weatherImgBase64: '',
  weatherTitle: '',
  illegalSector: '',
  rigHeading: '',
  bopHeading: '',
  edsUpdate: '',
  yellowM: '',
  yellowTime: '',
  redM: '',
  redTime: '',
  kposTime: '',
  riserTime: '',
  eds1: '',
  eds2: '',
  eds3: '',
  eds4: '',
  eds5: '',
  eds1Visible: true,
  eds2Visible: true,
  eds3Visible: true,
  eds4Visible: false,
  eds5Visible: false,
  cargoExplosive: '',
  cargoRadio: '',
  cargoNote: '',
  engUnav: '',
  thrUnav: '',
  equipRemarks: '',
  listaBarcos: [],
  acousticSystems: [
     {
        id: 1,
        type: 'LBL',
        name: 'LBL 1',
        transponders: [
           { id: 101, name: 'M45', val: 80, floatId: 'F01', channelM: '412', channelB: '422', serial: 'SN123' },
           { id: 102, name: 'M43', val: 60, floatId: 'F02', channelM: '414', channelB: '424', serial: 'SN124' }
        ]
     }
  ],
  flightsList: [],
  statusTags: [],
  timestamp: Date.now(),
  pocoNome: '',
  pocoCoordenadas: '',
  pocoRota: '',
  edsStatus: '',
  latchStatus: '',
  equipTipo: '',
  equipQtd: 0,
  equipObs: '',
  acousticSystem: '',
  acousticFreq: '',
  acousticObs: '',
  weatherStatus: '',
  flightStatus: '',
  weatherObs: '',
  tags: '',
};
