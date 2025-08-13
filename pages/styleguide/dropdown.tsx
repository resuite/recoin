import { Dropdown } from '@/components/ui/dropdown'
import { Cell } from 'retend'

const DropdownTest = () => {
   const options = [
      { label: 'Apple', value: 'apple' },
      { label: 'Mango', value: 'mango' },
      { label: 'Banana', value: 'banana' },
      { label: 'Pawpaw', value: 'pawpaw' },
      { label: 'Guava', value: 'guava' }
   ]

   const selected = Cell.source(options[0])
   const selectedLabel = Cell.derived(() => selected.get().label)

   return (
      <div class='grid place-items-center place-content-center h-screen w-screen light-scheme'>
         <Dropdown list:class='light-scheme' selectedOption={selected} options={options} />
         <br />
         This is a dropdown test. <br />
         <span>
            The selected is <b>{selectedLabel} </b>
         </span>
      </div>
   )
}

export default DropdownTest
