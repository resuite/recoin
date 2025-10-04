export function achievementTitleAndMessage(name: string) {
   switch (name) {
      case 'first_transaction':
         return {
            title: 'Activated.',
            message: 'You earned this coin by making your first transaction. Well done and welcome!'
         }
      default:
         return {
            title: 'Achievement',
            message: 'You did something awesome. Well done!'
         }
   }
}
