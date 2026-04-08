import { useEffect, useState } from 'react'
import SearchForm from './components/SearchForm.jsx'
import ResultTable from './components/ResultTable.jsx'
import './App.css'

function App() {
  const [studentId, setStudentId] = useState('')
  const [results, setResults] = useState([])
  const [studentInfo, setStudentInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchNonce, setSearchNonce] = useState(0)

  useEffect(() => {
    if (!studentId) return

    let cancelled = false
    setIsLoading(true)
    setError('')
    setStudentInfo(null)
    setResults([])

    const timeoutId = setTimeout(async () => {
      try {
        const [studentsRes, resultsRes] = await Promise.all([
          fetch('/sinhvien.json'),
          fetch('/results.json'),
        ])

        if (!studentsRes.ok || !resultsRes.ok) {
          throw new Error('Fetch failed')
        }

        const students = await studentsRes.json()
        const allResults = await resultsRes.json()

        const foundStudent = students.find((s) => s.id === studentId)
        if (!foundStudent) {
          if (!cancelled) {
            setError(`Không tìm thấy sinh viên với mã: ${studentId}`)
            setStudentInfo(null)
            setResults([])
          }
          return
        }

        const studentResults = allResults.filter(
          (r) => r.studentId === studentId,
        )

        if (!cancelled) {
          setStudentInfo(foundStudent)
          setResults(studentResults)
        }
      } catch {
        if (!cancelled) {
          setError('Có lỗi khi tải dữ liệu. Vui lòng thử lại.')
          setStudentInfo(null)
          setResults([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }, 2000)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [studentId, searchNonce])

  const handleSearch = (id) => {
    setStudentId(id)
    setSearchNonce((n) => n + 1)
  }

  return (
    <div className="app">
      <h1>Tra cứu kết quả học tập</h1>

      <SearchForm onSearch={handleSearch} isLoading={isLoading} />

      <div className="status">
        {isLoading && <p className="loading">Đang tải...</p>}
        {!isLoading && error && <p className="error">{error}</p>}
      </div>

      {!isLoading && !error && (
        <ResultTable studentInfo={studentInfo} results={results} />
      )}
    </div>
  )
}

export default App
