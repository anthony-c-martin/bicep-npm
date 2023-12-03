export interface CompileRequest {
    path: string;
  }
  
  export interface CompileResponse {
    success: boolean;
    diagnostics: CompileResponseDiagnostic[];
    contents?: string;
  }
  
  export interface CompileResponseDiagnostic {
    line: number;
    char: number;
    level: string;
    code: string;
    message: string;
  }
  
  export interface ValidateRequest {
    subscriptionId: string;
    resourceGroup: string;
    path: string;
  }
  
  export interface ValidateResponse {
    error?: ValidateResponseError;
  }
  
  export interface ValidateResponseError {
    code: string;
    message: string;
    target?: string;
    details?: ValidateResponseError[];
  }