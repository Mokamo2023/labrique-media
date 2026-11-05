import type * as React from 'react';

export type Theme = 'affiche' | 'sombre' | 'os';
export type Verdict = 'SWISH' | 'REBOND' | 'BRIQUE';
export type TypeMontage = 'lumiere' | 'grosplan' | 'echo' | 'eclat' | 'replay' | 'carte';
/** Montage Replay : point visé par le viseur (x, y) et taille du cadre (t), dans le repère 1080. */
export interface Cible { x?: number; y?: number; t?: number }
/** Montage Carte : texte de la bande et numéro. */
export interface InfoCarte { equipe?: string; numero?: string; serie?: string; /** false : pas de bande équipe en bas de carte, quand le joueur la cacherait */ bande?: boolean }
/** Brique du montage Éclat : centre, taille, inclinaison (degrés), écart de la cassure (px), bascule des moitiés (degrés). */
export interface Brique { cx?: number; cy?: number; l?: number; h?: number; angle?: number; ecart?: number; bascule?: number }
/** Position du joueur détouré dans le repère 1080 : gauche, haut, largeur. */
export interface Cadre { x?: number; y?: number; l?: number }
export interface Equipe { nom: string; score: string; gagnant?: boolean }

export interface PostProps { theme?: Theme; echelle?: number; hauteur?: 1350 | 1920; motif?: boolean; reperes?: boolean; grain?: boolean; children?: React.ReactNode }
export declare function Post(props: PostProps): React.ReactElement;
export interface LogoProps { variante?: 'ligne' | 'empile'; taille?: number; couleur?: string }
export declare function Logo(props: LogoProps): React.ReactElement;
export interface IconeBriqueProps { largeur?: number; couleur?: string; epaisseur?: number }
export declare function IconeBrique(props: IconeBriqueProps): React.ReactElement;
export interface SceauProps { variante?: 'os' | 'encre' | 'orange'; taille?: number; texte?: string }
export declare function Sceau(props: SceauProps): React.ReactElement;
export interface SceauVerdictProps { verdict?: Verdict; taille?: number; rotation?: number; libre?: boolean; style?: React.CSSProperties }
export declare function SceauVerdict(props: SceauVerdictProps): React.ReactElement;
export interface PastilleProps { variante?: 'pleine' | 'contour' | 'format'; children?: React.ReactNode }
export declare function Pastille(props: PastilleProps): React.ReactElement;
export interface SurtitreProps { filet?: boolean; children?: string }
export declare function Surtitre(props: SurtitreProps): React.ReactElement;
export interface NomJoueurProps { prenom?: string; nom: string; taille?: number; min?: number; accent?: boolean }
export declare function NomJoueur(props: NomJoueurProps): React.ReactElement;
export interface PunchlineProps { children?: string }
export declare function Punchline(props: PunchlineProps): React.ReactElement;
export interface MotHerosProps { texte: string; taille?: number; couleur?: string; vertical?: boolean; interligne?: number; approche?: string; align?: 'left' | 'center'; position?: React.CSSProperties; ajuster?: boolean; min?: number; relief?: boolean; echo?: boolean; z?: number }
export declare function MotHeros(props: MotHerosProps): React.ReactElement;
export interface TableauScoreProps { equipes: Equipe[]; statut?: string | null }
export declare function TableauScore(props: TableauScoreProps): React.ReactElement;
export interface TagVerticalProps { cote?: 'droite' | 'gauche'; children?: string }
export declare function TagVertical(props: TagVerticalProps): React.ReactElement;
export declare function Reperes(props: { hauteur?: number }): React.ReactElement;
export declare function Grain(props: { hauteur?: number; opacite?: number }): React.ReactElement;
export interface BandeauProps { format?: string }
export declare function Bandeau(props: BandeauProps): React.ReactElement;
export interface BlocBasProps { prenom?: string; nom?: string; pastilles?: string[]; punchline?: string; meta?: string | false; signature?: string }
export declare function BlocBas(props: BlocBasProps): React.ReactElement;
export interface MontageProps { type?: TypeMontage; couche?: 'fond' | 'avant'; photo?: string; fantome?: string; grosPlan?: string; photoPlein?: string; cadre?: Cadre; cadrePlein?: Cadre; brique?: Brique; heros?: { texte: string; taille?: number; couleur?: string; interligne?: number; approche?: string }; cible?: Cible; etiquette?: string; timecode?: string; progression?: number; carte?: InfoCarte; carteCadre?: { x?: number; y?: number; l?: number; h?: number; angle?: number }; alt?: string }
export declare function Montage(props: MontageProps): React.ReactElement | null;

interface Commun { echelle?: number; theme?: Theme; format?: string; montage?: TypeMontage; photo?: string; fantome?: string; grosPlan?: string; photoPlein?: string; cadre?: Cadre; cadrePlein?: Cadre; brique?: Brique; cible?: Cible; etiquette?: string; timecode?: string; progression?: number; carte?: InfoCarte; carteCadre?: { x?: number; y?: number; l?: number; h?: number; angle?: number }; alt?: string; prenom?: string; nom?: string; pastilles?: string[]; punchline?: string; meta?: string; signature?: string; surtitre?: string }
export interface PostVerdictProps extends Commun { verdict: Verdict; score?: Equipe[]; statut?: string }
export declare function PostVerdict(props: PostVerdictProps): React.ReactElement;
export interface PostChiffreProps extends Commun { chiffre: string | number; tailleChiffre?: number; score?: Equipe[]; statut?: string; verdict?: Verdict; styleSceau?: React.CSSProperties }
export declare function PostChiffre(props: PostChiffreProps): React.ReactElement;
export interface PostAfficheProps extends Commun { titre: string; tailleTitre?: number; verdict?: Verdict; styleSceau?: React.CSSProperties }
export declare function PostAffiche(props: PostAfficheProps): React.ReactElement;
export interface Moitie { photo?: string; photoPlein?: string; cadrage?: string; noirEtBlanc?: boolean; etiquette?: string; prenom?: string; nom: string; stats?: string[]; cadre?: Cadre }
export interface PostFaceAFaceProps { echelle?: number; theme?: Theme; format?: string; question?: string; haut: Moitie; bas: Moitie }
export declare function PostFaceAFace(props: PostFaceAFaceProps): React.ReactElement;
export interface LigneClassement { nom: string; equipe?: string; valeur: string; unite?: string }
export interface PostClassementProps { echelle?: number; theme?: Theme; format?: string; titre: string; lignes: LigneClassement[]; photo?: string; punchline?: string; meta?: string; signature?: string }
export declare function PostClassement(props: PostClassementProps): React.ReactElement;
export interface EquipeEchange { nom: string; photo?: string; photoPlein?: string; recoit: string[] }
export interface PostEchangeProps { echelle?: number; theme?: Theme; format?: string; titre?: string; equipes: EquipeEchange[]; meta?: string; signature?: string }
export declare function PostEchange(props: PostEchangeProps): React.ReactElement;
export interface StoryUneProps { echelle?: number; theme?: Theme; titre: string }
export declare function StoryUne(props: StoryUneProps): React.ReactElement;

declare global { interface Window { LaBrique: { Post: typeof Post; Logo: typeof Logo; IconeBrique: typeof IconeBrique; Sceau: typeof Sceau; SceauVerdict: typeof SceauVerdict; Pastille: typeof Pastille; Surtitre: typeof Surtitre; NomJoueur: typeof NomJoueur; Punchline: typeof Punchline; MotHeros: typeof MotHeros; TableauScore: typeof TableauScore; TagVertical: typeof TagVertical; Reperes: typeof Reperes; Grain: typeof Grain; Bandeau: typeof Bandeau; BlocBas: typeof BlocBas; Montage: typeof Montage; PostVerdict: typeof PostVerdict; PostChiffre: typeof PostChiffre; PostAffiche: typeof PostAffiche; PostFaceAFace: typeof PostFaceAFace; PostClassement: typeof PostClassement; PostEchange: typeof PostEchange; StoryUne: typeof StoryUne } } }
