// src/components/EventFeed.jsx
import EventCard from "./EventCard";

const EventFeed = ({ events }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
      {events.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg">No significant events found.</p>
        </div>
      )}
    </div>
  );
};

export default EventFeed;