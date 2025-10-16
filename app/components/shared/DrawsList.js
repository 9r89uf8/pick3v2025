import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
  </div>
);

const DrawsList = ({ draws, loading }) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!draws || draws.length === 0) {
    return (
      <div className="text-center p-8">
        <h6 className="text-lg text-white/70">
          No draws available
        </h6>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden max-h-[400px] md:max-h-[600px] overflow-y-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-accent-gold/10 backdrop-blur-sm">
          <tr>
            <th className="px-4 py-3 text-left font-bold text-white">
              Date
            </th>
            <th className="px-4 py-3 text-left font-bold text-white">
              Sorted Numbers
            </th>
            <th className="px-4 py-3 text-left font-bold text-white">
              Fireball
            </th>
          </tr>
        </thead>
        <tbody>
          {draws.map((draw, index) => (
            <tr
              key={draw.id || index}
              className="border-t border-white/5 hover:bg-accent-gold/5 transition-colors odd:bg-white/[0.02]"
            >
              <td className="px-4 py-3 text-white">
                {draw.drawDate}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1 flex-wrap">
                  {[draw.sortedFirstNumber, draw.sortedSecondNumber, draw.sortedThirdNumber]
                    .filter(num => num !== undefined)
                    .map((num, numIndex) => (
                      <span
                        key={numIndex}
                        className="inline-flex items-center justify-center px-2 py-1 rounded bg-accent-gold/20 text-white font-bold text-sm min-w-[32px]"
                      >
                        {num}
                      </span>
                    ))}
                </div>
              </td>
              <td className="px-4 py-3 text-white">
                {draw.fireball !== undefined ? (
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[#ff6b35] text-white font-bold text-sm">
                    {draw.fireball}
                  </span>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DrawsList;
