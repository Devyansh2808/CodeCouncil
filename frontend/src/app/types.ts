export interface Finding {
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  explanation: string;
  suggested_fix: string;
}

export interface Argument {
  point: string;
  reasoning: string;
  condition_for_approval: string;
}

export interface ReviewResponse {
  persona: string;
  round: number;
  stance: 'approve' | 'changes' | 'block';
  bubble: string;
  findings: Finding[];
  arguments: Argument[];
  responding_to: string[];
}

export interface ActionItem {
  priority: number;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  raised_by: string;
  action: string;
}

export interface ManagerVerdict {
  verdict: 'approve' | 'approve_with_changes' | 'block';
  rationale: string;
  consensus_summary: string;
  dissent_summary: string;
  action_items: ActionItem[];
}
