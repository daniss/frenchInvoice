'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatFrenchDate, formatFrenchDateTime } from '@/lib/utils/french-formatting'

interface FrenchDateInputProps {
  label: string
  value?: Date
  onChange: (date: Date | undefined) => void
  required?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
  showTime?: boolean
  placeholder?: string
}

export function FrenchDateInput({
  label,
  value,
  onChange,
  required = false,
  minDate,
  maxDate,
  className = "",
  showTime = false,
  placeholder
}: FrenchDateInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [displayMonth, setDisplayMonth] = useState(new Date())

  useEffect(() => {
    if (value) {
      setInputValue(showTime ? formatFrenchDateTime(value) : formatFrenchDate(value))
    } else {
      setInputValue('')
    }
  }, [value, showTime])

  const parseFrenchDate = (dateStr: string): Date | null => {
    // Parse French date format: DD/MM/YYYY or DD/MM/YYYY HH:MM
    const datePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/
    const match = dateStr.match(datePattern)
    
    if (match) {
      const [, day, month, year, hour = '0', minute = '0'] = match
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1, // JavaScript months are 0-indexed
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      )
      
      // Validate the date
      if (date.getDate() === parseInt(day) && 
          date.getMonth() === parseInt(month) - 1 && 
          date.getFullYear() === parseInt(year)) {
        return date
      }
    }
    
    return null
  }

  const handleInputChange = (inputStr: string) => {
    setInputValue(inputStr)
    
    const parsedDate = parseFrenchDate(inputStr)
    if (parsedDate) {
      onChange(parsedDate)
    } else if (inputStr === '') {
      onChange(undefined)
    }
  }

  const generateCalendarDays = () => {
    const year = displayMonth.getFullYear()
    const month = displayMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const handleDateSelect = (date: Date) => {
    if (showTime && value) {
      // Preserve time when selecting date
      date.setHours(value.getHours(), value.getMinutes())
    }
    onChange(date)
    if (!showTime) {
      setIsCalendarOpen(false)
    }
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={`date-${label}`} className="text-sm font-medium flex items-center gap-2">
        <Calendar className="h-4 w-4 text-french-blue-600" />
        {label}
        {required && <span className="text-urgent-red-500">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={`date-${label}`}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder || (showTime ? "DD/MM/YYYY HH:MM" : "DD/MM/YYYY")}
          required={required}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-8 w-8 p-0"
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        >
          <Calendar className="h-4 w-4" />
        </Button>

        {isCalendarOpen && (
          <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 min-w-[300px]">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="text-sm font-medium">
                {monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}
              </h3>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((date, index) => (
                <button
                  key={index}
                  type="button"
                  className={`
                    w-8 h-8 text-sm rounded-md transition-colors
                    ${!date ? 'invisible' : ''}
                    ${date && isDateDisabled(date) 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'hover:bg-french-blue-50 text-gray-700'
                    }
                    ${date && value && date.toDateString() === value.toDateString()
                      ? 'bg-french-blue-600 text-white hover:bg-french-blue-700'
                      : ''
                    }
                    ${date && date.toDateString() === new Date().toDateString()
                      ? 'ring-1 ring-french-blue-300'
                      : ''
                    }
                  `}
                  onClick={() => date && !isDateDisabled(date) && handleDateSelect(date)}
                  disabled={!date || isDateDisabled(date)}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>

            {showTime && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm">Heure</Label>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={value?.getHours() || 0}
                    onChange={(e) => {
                      if (value) {
                        const newDate = new Date(value)
                        newDate.setHours(parseInt(e.target.value) || 0)
                        onChange(newDate)
                      }
                    }}
                    className="w-16 text-center"
                  />
                  <span className="text-gray-500">:</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={value?.getMinutes() || 0}
                    onChange={(e) => {
                      if (value) {
                        const newDate = new Date(value)
                        newDate.setMinutes(parseInt(e.target.value) || 0)
                        onChange(newDate)
                      }
                    }}
                    className="w-16 text-center"
                  />
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCalendarOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onChange(new Date())
                  setIsCalendarOpen(false)
                }}
                className="bg-french-blue-600 hover:bg-french-blue-700"
              >
                Aujourd'hui
              </Button>
            </div>
          </div>
        )}
      </div>

      {value && (
        <div className="text-xs text-gray-600">
          <span className="font-medium">Sélectionné: </span>
          {showTime ? formatFrenchDateTime(value) : formatFrenchDate(value)}
        </div>
      )}
    </div>
  )
}

export function FrenchDateDisplay({ 
  date, 
  showTime = false, 
  className = "" 
}: { 
  date: Date | string
  showTime?: boolean
  className?: string 
}) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return (
    <span className={`font-mono ${className}`}>
      {showTime ? formatFrenchDateTime(dateObj) : formatFrenchDate(dateObj)}
    </span>
  )
}