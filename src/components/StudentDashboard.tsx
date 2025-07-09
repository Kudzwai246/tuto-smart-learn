
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  BookOpen, 
  Users,
  Filter,
  User,
  Settings,
  Bell
} from 'lucide-react';
import TutoLogo from './TutoLogo';
import { pricingPlans } from '../data/pricing';

interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  rating: number;
  experience: number;
  location: string;
  distance: number;
  qualifications: string;
  availableSlots: string[];
  price: {
    individual: number;
    group: number;
  };
}

const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Sarah Makoni',
    subjects: ['Mathematics', 'Physics'],
    rating: 4.9,
    experience: 8,
    location: 'Harare CBD',
    distance: 2.1,
    qualifications: 'BSc Mathematics, PGCE',
    availableSlots: ['Monday 4PM', 'Wednesday 4PM', 'Friday 4PM'],
    price: { individual: 40, group: 7 }
  },
  {
    id: '2',
    name: 'James Mpofu',
    subjects: ['English', 'Literature'],
    rating: 4.7,
    experience: 5,
    location: 'Borrowdale',
    distance: 5.3,
    qualifications: 'BA English Literature',
    availableSlots: ['Tuesday 5PM', 'Thursday 5PM', 'Saturday 10AM'],
    price: { individual: 40, group: 7 }
  },
  {
    id: '3',
    name: 'Grace Nyoni',
    subjects: ['Chemistry', 'Biology'],
    rating: 4.8,
    experience: 10,
    location: 'Avondale',
    distance: 3.7,
    qualifications: 'BSc Chemistry, MSc Biology',
    availableSlots: ['Monday 3PM', 'Wednesday 3PM', 'Friday 3PM'],
    price: { individual: 40, group: 7 }
  }
];

const StudentDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [teachers] = useState<Teacher[]>(mockTeachers);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = !selectedSubject || teacher.subjects.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  const subjects = Array.from(new Set(teachers.flatMap(teacher => teacher.subjects)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <TutoLogo size="sm" />
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-orange-600 text-white">
        <div className="max-w-md mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
          <p className="text-orange-100">Find your perfect teacher today</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search teachers or subjects..."
            className="pl-10 pr-4 py-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button
            variant={selectedSubject === '' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSubject('')}
            className="whitespace-nowrap"
          >
            All Subjects
          </Button>
          {subjects.map(subject => (
            <Button
              key={subject}
              variant={selectedSubject === subject ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubject(subject)}
              className="whitespace-nowrap"
            >
              {subject}
            </Button>
          ))}
        </div>
      </div>

      {/* Teachers List */}
      <div className="max-w-md mx-auto px-4 pb-6 space-y-4">
        {filteredTeachers.map(teacher => (
          <Card key={teacher.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{teacher.name}</h3>
                  <p className="text-sm text-gray-600">{teacher.qualifications}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{teacher.rating}</span>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{teacher.location} • {teacher.distance}km away</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{teacher.experience} years experience</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{teacher.subjects.join(', ')}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {teacher.subjects.map(subject => (
                  <Badge key={subject} variant="secondary" className="text-xs">
                    {subject}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">${teacher.price.individual}/month (1-on-1)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">${teacher.price.group}/month (Group)</span>
                  </div>
                </div>
                
                <Button size="sm" className="bg-primary hover:bg-orange-600">
                  View Profile
                </Button>
              </div>

              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">
                  Available: {teacher.availableSlots.slice(0, 2).join(', ')}
                  {teacher.availableSlots.length > 2 && ` +${teacher.availableSlots.length - 2} more`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing Info Card */}
      <div className="max-w-md mx-auto px-4 pb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-900">
              Our Pricing Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pricingPlans.map(plan => (
              <div key={plan.level} className="bg-white p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 capitalize mb-2">
                  {plan.level === 'olevel' ? 'O-Level' : plan.level === 'alevel' ? 'A-Level' : 'Primary'}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Individual</p>
                    <p className="font-medium">${plan.individual.monthly}/month</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Group</p>
                    <p className="font-medium">${plan.group.monthly}/month</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-around">
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
              <Search className="w-5 h-5" />
              <span className="text-xs">Discover</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">My Lessons</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
              <Settings className="w-5 h-5" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
