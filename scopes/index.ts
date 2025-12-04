import { createScope, type SourceCell } from 'retend'

interface WaitingListState {
   emailEntered: SourceCell<boolean>
}

export const WaitingListStateScope = createScope<WaitingListState>('WaitingListState')
