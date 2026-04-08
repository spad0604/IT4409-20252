const students = [
    {name: "An", score: 85},
    {name: "Bình", score: 90},
    {name: "Giáp", score: 95},
    {name: "Dũng", score: 75}
]

const scores = students.map(s => s.score)

const average = scores.reduce((total, current) => total + current, 0)

console.log("Điểm trung bình ", average)