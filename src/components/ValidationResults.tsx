import { ValidationResult } from '@/types/api.types'

interface ValidationResultsProps {
  result: ValidationResult
}

export function ValidationResults({ result }: ValidationResultsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Validation Results for {result.domain}</h2>

        {/* Score and Status */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Overall Score</h3>
              <p className="text-3xl font-bold text-blue-600">{result.finalScore}/100</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-white font-semibold ${
              result.status === 'safe' ? 'bg-green-500' :
              result.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {result.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <p className="text-gray-700">{result.summary}</p>
        </div>

        {/* Individual Checks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(result.checks).map(([key, check]) => (
            <div key={key} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{check.name}</h4>
                <span className={`w-3 h-3 rounded-full ${check.passed ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{check.message}</p>
              <div className="flex justify-between text-sm">
                <span>Score: {check.score}/100</span>
                <span>Weight: {Math.round(check.weight * 100)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
            <ul className="list-disc list-inside space-y-1">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}