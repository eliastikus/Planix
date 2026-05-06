import { useMemo, useState } from 'react'
import heroImg from './assets/hero.png'
import { BackendStatus } from './components/BackendStatus'
import './App.css'

type TabId = 'teachers' | 'classes' | 'tracks'

type Teacher = {
  id: string
  firstName: string
  lastName: string
  availability: { from: string; to: string }
  days: string[]
  subjects: string[]
}

type SchoolYear = {
  yearNumber: number
  sections: string[]
}

type TrackLesson = {
  id: string
  subject: string
  weeklyHours: number
}

type StudyTrack = {
  id: string
  name: string
  lessons: TrackLesson[]
}

const daysOfWeek = ['Poniedzialek', 'Wtorek', 'Sroda', 'Czwartek', 'Piatek', 'Sobota', 'Niedziela']

function normalizeSections(rawText: string): string[] {
  return rawText
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter((value) => value.length > 0)
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('teachers')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null)
  const [subjectInput, setSubjectInput] = useState('')

  const [schoolName, setSchoolName] = useState('')
  const [startYearInput, setStartYearInput] = useState('')
  const [endYearInput, setEndYearInput] = useState('')
  const [bulkSectionsInput, setBulkSectionsInput] = useState('')
  const [singleSectionInput, setSingleSectionInput] = useState('')
  const [years, setYears] = useState<SchoolYear[]>([])
  const [selectedYearNumber, setSelectedYearNumber] = useState<number | null>(null)

  const [trackNameInput, setTrackNameInput] = useState('')
  const [tracks, setTracks] = useState<StudyTrack[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [trackLessonSubjectInput, setTrackLessonSubjectInput] = useState('')
  const [trackLessonHoursInput, setTrackLessonHoursInput] = useState('1')
  const [sectionTrackAssignments, setSectionTrackAssignments] = useState<Record<string, string[]>>({})

  const selectedTeacher = useMemo(
    () => teachers.find((teacher) => teacher.id === selectedTeacherId) ?? null,
    [teachers, selectedTeacherId],
  )

  const selectedYear = useMemo(
    () => years.find((year) => year.yearNumber === selectedYearNumber) ?? null,
    [years, selectedYearNumber],
  )

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? null,
    [tracks, selectedTrackId],
  )

  const sectionOptions = useMemo(
    () =>
      Array.from(new Set(years.flatMap((year) => year.sections)))
        .sort((a, b) => a.localeCompare(b))
        .map((section) => ({
          key: section,
          label: `Oddzial ${section} (wszystkie roczniki)`,
        })),
    [years],
  )

  const addTeacher = () => {
    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()
    if (!trimmedFirstName || !trimmedLastName) {
      alert('Podaj imie i nazwisko.')
      return
    }

    const teacher: Teacher = {
      id: crypto.randomUUID(),
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      availability: { from: '', to: '' },
      days: [],
      subjects: [],
    }

    setTeachers((prev) => [...prev, teacher])
    setSelectedTeacherId(teacher.id)
    setFirstName('')
    setLastName('')
  }

  const updateTeacher = (teacherId: string, updater: (teacher: Teacher) => Teacher) => {
    setTeachers((prev) =>
      prev.map((teacher) => (teacher.id === teacherId ? updater(teacher) : teacher)),
    )
  }

  const addSubject = () => {
    if (!selectedTeacher) return
    const subject = subjectInput.trim()
    if (!subject) return

    updateTeacher(selectedTeacher.id, (teacher) => ({
      ...teacher,
      subjects: [...teacher.subjects, subject],
    }))
    setSubjectInput('')
  }

  const removeSubject = (index: number) => {
    if (!selectedTeacher) return
    updateTeacher(selectedTeacher.id, (teacher) => ({
      ...teacher,
      subjects: teacher.subjects.filter((_, idx) => idx !== index),
    }))
  }

  const toggleDay = (day: string, checked: boolean) => {
    if (!selectedTeacher) return
    updateTeacher(selectedTeacher.id, (teacher) => ({
      ...teacher,
      days: checked
        ? teacher.days.includes(day)
          ? teacher.days
          : [...teacher.days, day]
        : teacher.days.filter((value) => value !== day),
    }))
  }

  const updateAvailability = (key: 'from' | 'to', value: string) => {
    if (!selectedTeacher) return
    updateTeacher(selectedTeacher.id, (teacher) => ({
      ...teacher,
      availability: { ...teacher.availability, [key]: value },
    }))
  }

  const generateYears = () => {
    const startYear = Number(startYearInput)
    const endYear = Number(endYearInput)

    if (
      !Number.isInteger(startYear) ||
      !Number.isInteger(endYear) ||
      startYear < 1 ||
      endYear < startYear
    ) {
      alert('Podaj poprawny zakres, np. 1-8 albo 4-5.')
      return
    }

    const newYears: SchoolYear[] = []
    for (let yearNumber = startYear; yearNumber <= endYear; yearNumber += 1) {
      newYears.push({ yearNumber, sections: [] })
    }

    setYears(newYears)
    setSelectedYearNumber(newYears[0]?.yearNumber ?? null)
    setSectionTrackAssignments({})
  }

  const addBulkSections = () => {
    const sections = normalizeSections(bulkSectionsInput)
    if (!sections.length) return

    setYears((prev) =>
      prev.map((year) => ({
        ...year,
        sections: [...year.sections, ...sections.filter((section) => !year.sections.includes(section))],
      })),
    )
    setBulkSectionsInput('')
  }

  const addSingleSection = () => {
    if (!selectedYear) return
    const section = singleSectionInput.trim().toUpperCase()
    if (!section) return

    setYears((prev) =>
      prev.map((year) =>
        year.yearNumber === selectedYear.yearNumber && !year.sections.includes(section)
          ? { ...year, sections: [...year.sections, section] }
          : year,
      ),
    )
    setSingleSectionInput('')
  }

  const removeSection = (sectionToRemove: string) => {
    if (!selectedYear) return
    const nextYears = years.map((year) =>
      year.yearNumber === selectedYear.yearNumber
        ? { ...year, sections: year.sections.filter((section) => section !== sectionToRemove) }
        : year,
    )
    setYears(nextYears)
    if (!nextYears.some((year) => year.sections.includes(sectionToRemove))) {
      setSectionTrackAssignments((prev) => {
        const next = { ...prev }
        delete next[sectionToRemove]
        return next
      })
    }
  }

  const addTrack = () => {
    const name = trackNameInput.trim()
    if (!name) {
      alert('Podaj nazwe kierunku lub tagu.')
      return
    }

    const newTrack: StudyTrack = {
      id: crypto.randomUUID(),
      name,
      lessons: [],
    }

    setTracks((prev) => [...prev, newTrack])
    setSelectedTrackId(newTrack.id)
    setTrackNameInput('')
  }

  const removeTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((track) => track.id !== trackId))
    setSelectedTrackId((prev) => (prev === trackId ? null : prev))
    setSectionTrackAssignments((prev) => {
      const next: Record<string, string[]> = {}
      Object.entries(prev).forEach(([sectionKey, assignedTracks]) => {
        const filtered = assignedTracks.filter((id) => id !== trackId)
        if (filtered.length) next[sectionKey] = filtered
      })
      return next
    })
  }

  const addTrackLesson = () => {
    if (!selectedTrack) return
    const subject = trackLessonSubjectInput.trim()
    const weeklyHours = Number(trackLessonHoursInput)
    if (!subject) return
    if (!Number.isInteger(weeklyHours) || weeklyHours < 1 || weeklyHours > 20) {
      alert('Liczba godzin musi byc liczba calkowita od 1 do 20.')
      return
    }

    const lesson: TrackLesson = {
      id: crypto.randomUUID(),
      subject,
      weeklyHours,
    }

    setTracks((prev) =>
      prev.map((year) =>
        year.id === selectedTrack.id ? { ...year, lessons: [...year.lessons, lesson] } : year,
      ),
    )
    setTrackLessonSubjectInput('')
    setTrackLessonHoursInput('1')
  }

  const removeTrackLesson = (lessonId: string) => {
    if (!selectedTrack) return
    setTracks((prev) =>
      prev.map((track) =>
        track.id === selectedTrack.id
          ? { ...track, lessons: track.lessons.filter((lesson) => lesson.id !== lessonId) }
          : track,
      ),
    )
  }

  const toggleTrackAssignmentForSection = (section: string, trackId: string, checked: boolean) => {
    setSectionTrackAssignments((prev) => {
      const current = prev[section] ?? []
      const next = checked
        ? current.includes(trackId)
          ? current
          : [...current, trackId]
        : current.filter((id) => id !== trackId)

      const output = { ...prev }
      if (next.length) output[section] = next
      else delete output[section]
      return output
    })
  }

  const getTrackNamesForSection = (section: string) => {
    const trackIds = sectionTrackAssignments[section] ?? []
    if (!trackIds.length) return []
    return trackIds
      .map((trackId) => tracks.find((track) => track.id === trackId)?.name)
      .filter((name): name is string => Boolean(name))
  }

  const totalTrackHours =
    selectedTrack?.lessons.reduce((total, lesson) => total + lesson.weeklyHours, 0) ?? 0

  return (
    <main className="app">
      <BackendStatus />
      <header className="hero">
        <img src={heroImg} className="hero-image" width="170" height="179" alt="Planix" />
        <div>
          <h1>Planix</h1>
          <p>Latwe planowanie nauczycieli, klas i kierunkow nauczania.</p>
        </div>
      </header>

      <nav className="tabs">
        <button
          type="button"
          className={activeTab === 'teachers' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('teachers')}
        >
          Nauczyciele
        </button>
        <button
          type="button"
          className={activeTab === 'classes' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('classes')}
        >
          Klasy
        </button>
        <button
          type="button"
          className={activeTab === 'tracks' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('tracks')}
        >
          Kierunki / Tagi
        </button>
      </nav>

      {activeTab === 'teachers' && (
        <section className="tab-panel active">
          <div className="card">
            <h2>Nauczyciele</h2>
            <p className="muted">Dodaj osobe, przypisz dostepnosc i przedmioty.</p>
            <div className="inline-inputs">
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Imie"
              />
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Nazwisko"
              />
              <button type="button" className="btn-primary" onClick={addTeacher}>
                Dodaj nauczyciela
              </button>
            </div>
          </div>

          <div className="grid-two">
            <div className="card">
              <h3>Lista nauczycieli</h3>
              {teachers.length === 0 && <p className="empty">Brak nauczycieli. Dodaj pierwsza osobe.</p>}
              <ul className="list">
                {teachers.map((teacher) => (
                  <li key={teacher.id}>
                    <button
                      type="button"
                      className={teacher.id === selectedTeacherId ? 'list-item active' : 'list-item'}
                      onClick={() => setSelectedTeacherId(teacher.id)}
                    >
                      {teacher.firstName} {teacher.lastName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {selectedTeacher && (
              <div className="card">
                <h3>
                  Szczegoly: {selectedTeacher.firstName} {selectedTeacher.lastName}
                </h3>

                <div className="inline-inputs">
                  <label>
                    Od
                    <input
                      type="time"
                      value={selectedTeacher.availability.from}
                      onChange={(event) => updateAvailability('from', event.target.value)}
                    />
                  </label>
                  <label>
                    Do
                    <input
                      type="time"
                      value={selectedTeacher.availability.to}
                      onChange={(event) => updateAvailability('to', event.target.value)}
                    />
                  </label>
                </div>

                <h4>Dostepnosc</h4>
                <div className="days-grid">
                  {daysOfWeek.map((day) => (
                    <label key={day}>
                      <input
                        type="checkbox"
                        checked={selectedTeacher.days.includes(day)}
                        onChange={(event) => toggleDay(day, event.target.checked)}
                      />
                      {day}
                    </label>
                  ))}
                </div>

                <h4>Przedmioty</h4>
                <div className="inline-inputs">
                  <input
                    value={subjectInput}
                    onChange={(event) => setSubjectInput(event.target.value)}
                    placeholder="Np. Matematyka"
                  />
                  <button type="button" className="btn-primary" onClick={addSubject}>
                    Dodaj przedmiot
                  </button>
                </div>
                <ul className="list compact">
                  {selectedTeacher.subjects.map((subject, index) => (
                    <li key={`${subject}-${index}`} className="row-between">
                      <span>{subject}</span>
                      <button type="button" className="btn-danger" onClick={() => removeSubject(index)}>
                        Usun
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'classes' && (
        <section className="tab-panel active">
          <div className="card">
            <h2>Klasy</h2>
            <p className="muted">Szybko wygeneruj lata i oddzialy dla calej szkoly.</p>
            <div className="inline-inputs">
              <input
                value={schoolName}
                onChange={(event) => setSchoolName(event.target.value)}
                placeholder="Nazwa szkoly (opcjonalnie)"
              />
              <input
                type="number"
                value={startYearInput}
                onChange={(event) => setStartYearInput(event.target.value)}
                placeholder="Od"
              />
              <input
                type="number"
                value={endYearInput}
                onChange={(event) => setEndYearInput(event.target.value)}
                placeholder="Do"
              />
              <button type="button" className="btn-primary" onClick={generateYears}>
                Generuj klasy
              </button>
            </div>
            <div className="inline-inputs">
              <input
                value={bulkSectionsInput}
                onChange={(event) => setBulkSectionsInput(event.target.value)}
                placeholder="Oddzialy zbiorczo, np. A,B,C"
              />
              <button type="button" onClick={addBulkSections}>
                Dodaj do wszystkich klas
              </button>
            </div>
          </div>

          <div className="grid-two">
            <div className="card">
              <h3>Lista klas</h3>
              {years.length === 0 && <p className="empty">Brak klas. Uzyj generatora powyzej.</p>}
              <ul className="list">
                {years.map((year) => (
                  <li key={year.yearNumber}>
                    <button
                      type="button"
                      className={year.yearNumber === selectedYearNumber ? 'list-item active' : 'list-item'}
                      onClick={() => setSelectedYearNumber(year.yearNumber)}
                    >
                      Klasa {year.yearNumber}
                      {schoolName ? ` ${schoolName}` : ''} (
                      {year.sections.join(', ') || 'brak oddzialow'})
                      {year.sections.length > 0 &&
                        ` | kierunki: ${
                          year.sections
                            .flatMap((section) => getTrackNamesForSection(section))
                            .filter((value, index, array) => array.indexOf(value) === index)
                            .join(', ') || 'brak'
                        }`}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {selectedYear && (
              <div className="card">
                <h3>
                  Edycja: Klasa {selectedYear.yearNumber}
                  {schoolName ? ` ${schoolName}` : ''}
                </h3>
                <div className="inline-inputs">
                  <input
                    value={singleSectionInput}
                    onChange={(event) => setSingleSectionInput(event.target.value)}
                    placeholder="Dodaj oddzial, np. D"
                  />
                  <button type="button" className="btn-primary" onClick={addSingleSection}>
                    Dodaj oddzial
                  </button>
                </div>
                <ul className="list compact">
                  {selectedYear.sections.map((section) => (
                    <li key={section} className="row-between">
                      <span>
                        Oddzial {section}
                        {(() => {
                          const names = getTrackNamesForSection(section)
                          return names.length ? ` - ${names.join(', ')}` : ''
                        })()}
                      </span>
                      <button type="button" className="btn-danger" onClick={() => removeSection(section)}>
                        Usun
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'tracks' && (
        <section className="tab-panel active">
          <div className="card">
            <h2>Kierunki / Tagi</h2>
            <p className="muted">
              Zdefiniuj kierunek (np. Technik Programista) i przypisz tygodniowa liczbe godzin
              przedmiotow.
            </p>
            <div className="inline-inputs">
              <input
                value={trackNameInput}
                onChange={(event) => setTrackNameInput(event.target.value)}
                placeholder="Np. Technik Programista"
              />
              <button type="button" className="btn-primary" onClick={addTrack}>
                Dodaj kierunek
              </button>
            </div>
          </div>

          <div className="grid-two">
            <div className="card">
              <h3>Dostepne kierunki</h3>
              {tracks.length === 0 && (
                <p className="empty">Brak kierunkow. Dodaj pierwszy kierunek lub tag nauczania.</p>
              )}
              <ul className="list">
                {tracks.map((track) => (
                  <li key={track.id} className="row-between">
                    <button
                      type="button"
                      className={track.id === selectedTrackId ? 'list-item active' : 'list-item'}
                      onClick={() => setSelectedTrackId(track.id)}
                    >
                      {track.name}
                    </button>
                    <button type="button" className="btn-danger" onClick={() => removeTrack(track.id)}>
                      Usun
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {selectedTrack && (
              <div className="card">
                <h3>{selectedTrack.name}</h3>
                <p className="muted">Laczna liczba godzin tygodniowo: {totalTrackHours}</p>
                <div className="inline-inputs">
                  <input
                    value={trackLessonSubjectInput}
                    onChange={(event) => setTrackLessonSubjectInput(event.target.value)}
                    placeholder="Przedmiot, np. Matematyka rozszerzona"
                  />
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={trackLessonHoursInput}
                    onChange={(event) => setTrackLessonHoursInput(event.target.value)}
                    placeholder="Godzin / tydz."
                  />
                  <button type="button" className="btn-primary" onClick={addTrackLesson}>
                    Dodaj lekcje
                  </button>
                </div>
                {selectedTrack.lessons.length === 0 && (
                  <p className="empty">Brak lekcji dla tego kierunku. Dodaj pierwsza pozycje.</p>
                )}
                <ul className="list compact">
                  {selectedTrack.lessons.map((lesson) => (
                    <li key={lesson.id} className="row-between">
                      <span>
                        {lesson.subject} - {lesson.weeklyHours} godz./tydz.
                      </span>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => removeTrackLesson(lesson.id)}
                      >
                        Usun
                      </button>
                    </li>
                  ))}
                </ul>

                <h4>Przypisz kierunek do oddzialu (dla wszystkich rocznikow)</h4>
                {!sectionOptions.length && (
                  <p className="empty">Najpierw dodaj klasy i oddzialy w zakladce "Klasy".</p>
                )}
                {sectionOptions.length > 0 && (
                  <div className="assignment-list">
                    {sectionOptions.map((sectionOption) => (
                      <label key={sectionOption.key} className="assignment-item">
                        <input
                          type="checkbox"
                          checked={(sectionTrackAssignments[sectionOption.key] ?? []).includes(
                            selectedTrack.id,
                          )}
                          onChange={(event) =>
                            toggleTrackAssignmentForSection(
                              sectionOption.key,
                              selectedTrack.id,
                              event.target.checked,
                            )
                          }
                        />
                        {sectionOption.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

export default App
