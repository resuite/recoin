import { Dropdown } from '@/components/ui/dropdown'
import { Cell } from 'retend'

const DropdownTest = () => {
   const options = [
      { label: 'Apple', value: 'apple' },
      { label: 'Mango', value: 'mango' },
      { label: 'Banana', value: 'banana' },
      { label: 'Pawpaw', value: 'pawpaw' },
      { label: 'Guava', value: 'guava' },
      { label: 'Orange', value: 'orange' },
      { label: 'Pineapple', value: 'pineapple' },
      { label: 'Strawberry', value: 'strawberry' },
      { label: 'Blueberry', value: 'blueberry' },
      { label: 'Watermelon', value: 'watermelon' },
      { label: 'Grapes', value: 'grapes' },
      { label: 'Peach', value: 'peach' },
      { label: 'Cherry', value: 'cherry' },
      { label: 'Lemon', value: 'lemon' },
      { label: 'Kiwi', value: 'kiwi' }
   ]

   const selected = Cell.source(options[0])
   const selectedLabel = Cell.derived(() => selected.get().label)

   return (
      <div class='grid gap-0.5 place-items-center place-content-center h-screen light-scheme w-screen'>
         <Dropdown list:class='light-scheme' selectedOption={selected} options={options} />
         <span>This is a dropdown test.</span>
         <span>
            The selected item is <b>{selectedLabel} </b>
         </span>
      </div>
   )
}

export default DropdownTest
