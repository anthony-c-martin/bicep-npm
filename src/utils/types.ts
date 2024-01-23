export interface VersionRequest {}

export interface VersionResponse {
  version: string;
}

export interface GetDeploymentGraphRequest {
  path: string;
}

export interface GetDeploymentGraphResponse {
  nodes: GetDeploymentGraphResponseNode[];
  edges: GetDeploymentGraphResponseEdge[];
}

export interface GetDeploymentGraphResponseNode {
  range: Range;
  name: string;
  type: string;
  isExisting: boolean;
  relativePath?: string;
}

export interface GetDeploymentGraphResponseEdge {
  source: string;
  target: string;
}

export interface Position {
  line: number;
  char: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface CompileRequest {
  path: string;
}

export interface CompileResponse {
  success: boolean;
  diagnostics: CompileResponseDiagnostic[];
  contents?: string;
}

export interface CompileParamsRequest {
  path: string;
  parameterOverrides: Record<string, any>;
}

export interface CompileParamsResponse {
  success: boolean;
  diagnostics: CompileResponseDiagnostic[];
  parameters?: string;
  template?: string;
  templateSpecId?: string;
}

export interface CompileResponseDiagnostic {
  range: Range;
  level: 'Info' | 'Warning' | 'Error';
  code: string;
  message: string;
}

export interface GetMetadataRequest {
  path: string;
}

export interface GetMetadataResponse {
  metadata: MetadataDefinition[];
  parameters: ParamDefinition[];
  outputs: ParamDefinition[];
}

export interface MetadataDefinition {
  name: string;
  value: string;
}

export interface ParamDefinition {
  range: Range;
  name: string;
  type?: TypeDescription;
  description?: string;
}

export interface TypeDescription {
  range?: Range;
  name: string;
}

export interface GetFileReferencesRequest {
  path: string;
}

export interface GetFileReferencesResponse {
  filePaths: string[];
}