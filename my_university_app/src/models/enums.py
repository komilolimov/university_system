from enum import Enum as PyEnum

class ProgramType(str, PyEnum):
    Primary_Major = 'Primary Major'
    Secondary_Major = 'Secondary Major'
    Minor = 'Minor'

class EnrollmentStatus(str, PyEnum):
    Enrolled = 'Enrolled'
    Waitlisted = 'Waitlisted'
    Dropped = 'Dropped'
    Completed = 'Completed'

class RoomType(str, PyEnum):
    Lecture_Hall = 'Lecture Hall'
    Seminar_Room = 'Seminar Room'
    Wet_Lab = 'Wet Lab'
    Computer_Lab = 'Computer Lab'
    Office = 'Office'

class RegionType(str, PyEnum):
    EU = 'EU'
    Non_EU = 'Non-EU'
    USA = 'USA'
    Domestic = 'Domestic'
