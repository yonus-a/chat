import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import jalaali from 'jalaali-js'

export const useDateHandler = () => {
    const { locale } = useI18n()

    const isPersian = computed(() => locale.value === 'fa')

    // Helper: Convert English digits to Persian digits
    const toPersianNumbers = (str: string | number | null | undefined) => {
        if (str === null || str === undefined) return ''
        const s = String(str)
        const map: Record<string, string> = { '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴', '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹' }
        return s.replace(/[0-9]/g, (c) => map[c] || c)
    }

    // Helper: Auto-format numbers based on locale
    const formatNumber = (num: number | string) => {
        return isPersian.value ? toPersianNumbers(num) : String(num)
    }

    // 1. Get Years Range
    const getYears = (prevOffset: number, nextOffset: number) => {
        const currentYear = isPersian.value
            ? jalaali.toJalaali(new Date()).jy
            : new Date().getFullYear()

        const years = []
        for (let i = currentYear - prevOffset; i <= currentYear + nextOffset; i++) {
            years.push({ label: formatNumber(i), value: i })
        }
        return years.reverse()
    }

    // 2. Get Month Names
    const getMonthNames = () => {
        if (isPersian.value) {
            return [
                'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
                'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
            ].map((name, index) => ({ label: name, value: index + 1 }))
        } else {
            return [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ].map((name, index) => ({ label: name, value: index + 1 }))
        }
    }

    // 3. Get Days in Month
    const getDaysInMonth = (year: number | null, month: number | null) => {
        if (!year || !month) return []

        let daysCount = 31
        if (isPersian.value) {
            daysCount = jalaali.jalaaliMonthLength(year, month)
        } else {
            daysCount = new Date(year, month, 0).getDate()
        }

        return Array.from({ length: daysCount }, (_, i) => ({
            label: formatNumber(i + 1),
            value: i + 1
        }))
    }

    // 4. Convert { year, month, day } to JS Date Object
    const convertToDate = (year: number | null | undefined, month: number | null | undefined, day: number | null | undefined): Date | null => {
        if (!year || !month || !day) return null

        try {
            if (isPersian.value) {
                // jalaali-js throws if date is invalid, convert safely
                const gDate = jalaali.toGregorian(year, month, day)
                return new Date(gDate.gy, gDate.gm - 1, gDate.gd)
            } else {
                return new Date(year, month - 1, day)
            }
        } catch (e) {
            return null
        }
    }

    // 5. Parse ISO String to { year, month, day }
    const parseDate = (dateStr: string | Date | undefined | null) => {
        if (!dateStr) return { year: null, month: null, day: null }
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return { year: null, month: null, day: null }

        if (isPersian.value) {
            const j = jalaali.toJalaali(d)
            return { year: j.jy, month: j.jm, day: j.jd }
        } else {
            return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
        }
    }

    return {
        isPersian,
        toPersianNumbers,
        getYears,
        getMonthNames,
        getDaysInMonth,
        convertToDate,
        parseDate
    }
}