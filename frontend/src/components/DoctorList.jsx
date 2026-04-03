import doctors from "../data/doctors.json";

const DoctorList = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Doctors</h1>
      <ul className="divide-y divide-gray-200">
        {doctors.map((doctor) => (
          <li key={doctor.id} className="py-4">
            <h2 className="text-2xl font-bold">{doctor.name}</h2>
            <p className="text-gray-600">Specialty: {doctor.specialty}</p>
            <h3 className="text-xl font-semibold mt-2">Schedules:</h3>
            <ul className="list-disc list-inside pl-4">
              {doctor.schedules.map((schedule, index) => (
                <li key={index} className="mt-1">
                  <p className="font-medium">Hospital: {schedule.hospital}</p>
                  <p>Available Days: {schedule.availableDays.join(", ")}</p>
                  <p>Time: {schedule.time}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorList;
