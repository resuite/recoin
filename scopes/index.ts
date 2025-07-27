import { type SourceCell, createScope } from 'retend'

interface WaitingListState {
   emailEntered: SourceCell<boolean>
}

export const WaitingListStateScope = createScope<WaitingListState>('WaitingListState')
